import express from 'express';
import { User } from '../models/index.js';
import { verifyPassword } from '../utils/password.js';
import { signToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase().trim(), is_active: true } });

    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    if (user.role === 'trial') {
      if (user.trial_expires_at && new Date(user.trial_expires_at) < new Date()) {
        return res.status(403).json({ error: 'Tu período de prueba ha expirado. Contacta a tu administrador.' });
      }
    }

    const token = signToken({
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id,
        trialInfo: user.role === 'trial' ? {
          expiresAt: user.trial_expires_at,
          maxCalls: user.max_calls,
          callsUsed: user.calls_used,
          callsRemaining: user.max_calls - user.calls_used
        } : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// POST /api/auth/logout — stateless JWT, nothing to invalidate server-side
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

// GET /api/auth/verify
router.get('/verify', async (req, res) => {
  const header = req.headers['authorization'];
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    const jwt = await import('jsonwebtoken');
    const SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod';
    const decoded = jwt.default.verify(header.slice(7), SECRET);

    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'name', 'email', 'role', 'trial_expires_at', 'max_calls', 'calls_used']
    });

    if (!user) return res.status(401).json({ authenticated: false });

    return res.json({
      authenticated: true,
      tenantId: decoded.tenantId,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        trialInfo: user.role === 'trial' ? {
          expiresAt: user.trial_expires_at,
          maxCalls: user.max_calls,
          callsUsed: user.calls_used,
          callsRemaining: user.max_calls - user.calls_used
        } : null
      }
    });
  } catch {
    return res.status(401).json({ authenticated: false });
  }
});

export default router;
