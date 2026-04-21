import express from 'express';
import { User } from '../models/index.js';
import { hashPassword } from '../utils/password.js';

const router = express.Router();

// Middleware: only master users
function masterOnly(req, res, next) {
  if (req.user?.role !== 'master') {
    return res.status(403).json({ error: 'Solo la cuenta maestra puede acceder aquí' });
  }
  next();
}

// GET /api/admin/trials — list all trial users
router.get('/trials', masterOnly, async (req, res) => {
  try {
    const users = await User.findAll({
      where: { tenant_id: req.tenantId, role: 'trial' },
      attributes: ['id', 'name', 'email', 'role', 'trial_expires_at', 'max_calls', 'calls_used', 'is_active', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    console.error('Error listing trials:', error);
    res.status(500).json({ error: 'Error al listar cuentas de prueba' });
  }
});

// POST /api/admin/trials — create a trial account
router.post('/trials', masterOnly, async (req, res) => {
  try {
    const { name, email, password, days = 3, max_calls = 10 } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    const existing = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(400).json({ error: 'Ya existe una cuenta con ese email' });
    }

    const trialExpiry = new Date();
    trialExpiry.setDate(trialExpiry.getDate() + parseInt(days));

    const user = await User.create({
      tenant_id: req.tenantId,
      email: email.toLowerCase().trim(),
      name,
      password_hash: hashPassword(password),
      role: 'trial',
      trial_expires_at: trialExpiry,
      max_calls: parseInt(max_calls),
      calls_used: 0,
      is_active: true
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      trial_expires_at: user.trial_expires_at,
      max_calls: user.max_calls,
      calls_used: user.calls_used,
      is_active: user.is_active
    });
  } catch (error) {
    console.error('Error creating trial:', error);
    res.status(500).json({ error: 'Error al crear cuenta de prueba' });
  }
});

// PATCH /api/admin/trials/:id — extend or deactivate
router.patch('/trials/:id', masterOnly, async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id, tenant_id: req.tenantId, role: 'trial' } });
    if (!user) return res.status(404).json({ error: 'Cuenta no encontrada' });

    const { days, is_active, max_calls } = req.body;

    if (days !== undefined) {
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + parseInt(days));
      user.trial_expires_at = newExpiry;
    }
    if (is_active !== undefined) user.is_active = is_active;
    if (max_calls !== undefined) user.max_calls = parseInt(max_calls);

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cuenta' });
  }
});

// DELETE /api/admin/trials/:id
router.delete('/trials/:id', masterOnly, async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id, tenant_id: req.tenantId, role: 'trial' } });
    res.json({ message: 'Cuenta eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cuenta' });
  }
});

export default router;
