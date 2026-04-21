import express from 'express';
import { User } from '../models/index.js';
import { verifyPassword } from '../utils/password.js';

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

    req.session = req.session || {};
    req.session.tenantId = user.tenant_id;
    req.session.userId = user.id;
    req.session.role = user.role;

    res.json({
      success: true,
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

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session = null;
  res.json({ success: true });
});

// GET /api/auth/verify
router.get('/verify', async (req, res) => {
  const tenantId = req.session?.tenantId || req.headers['x-tenant-id'];
  const userId = req.session?.userId;
  if (!tenantId) {
    return res.status(401).json({ authenticated: false });
  }
  let trialInfo = null;
  if (userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ['role', 'trial_expires_at', 'max_calls', 'calls_used', 'name', 'email']
      });
      if (user?.role === 'trial') {
        trialInfo = {
          expiresAt: user.trial_expires_at,
          maxCalls: user.max_calls,
          callsUsed: user.calls_used,
          callsRemaining: user.max_calls - user.calls_used
        };
      }
      return res.json({
        authenticated: true,
        tenantId,
        user: user ? { id: userId, name: user.name, email: user.email, role: user.role, trialInfo } : null
      });
    } catch { /* fall through */ }
  }
  res.json({ authenticated: true, tenantId, user: null });
});

export default router;
