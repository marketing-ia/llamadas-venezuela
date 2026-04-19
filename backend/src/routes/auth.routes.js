import express from 'express';
import { Tenant } from '../models/index.js';

const router = express.Router();

// POST /api/auth/login - Login with tenant key
router.post('/login', async (req, res) => {
  try {
    const { tenantKey } = req.body;

    if (!tenantKey) {
      return res.status(400).json({ error: 'Missing tenant key' });
    }

    // Accept "tenant1" shorthand or the full UUID
    const resolvedKey = tenantKey === 'tenant1'
      ? '00000000-0000-0000-0000-000000000001'
      : tenantKey;

    const tenant = await Tenant.findByPk(resolvedKey, {
      attributes: ['id', 'name']
    });

    if (!tenant) {
      return res.status(401).json({ error: 'Invalid tenant key' });
    }

    // Set session or return JWT
    req.session = req.session || {};
    req.session.tenantId = tenant.id;

    res.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/logout - Logout
router.post('/logout', (req, res) => {
  req.session = null;
  res.json({ success: true });
});

// GET /api/auth/verify - Check current session
router.get('/verify', (req, res) => {
  if (req.session?.tenantId) {
    res.json({ authenticated: true, tenantId: req.session.tenantId });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

export default router;
