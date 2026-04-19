import express from 'express';
import { Operator } from '../models/index.js';

const router = express.Router();

// GET /api/operators - List all operators for tenant
router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const operators = await Operator.findAll({
      where: { tenant_id: tenantId },
      attributes: ['id', 'name', 'email', 'twilio_number', 'status', 'createdAt']
    });

    res.json({ operators, total: operators.length });
  } catch (error) {
    console.error('Error fetching operators:', error);
    res.status(500).json({ error: 'Failed to fetch operators' });
  }
});

// GET /api/operators/:id - Get operator details
router.get('/:id', async (req, res) => {
  try {
    const operator = await Operator.findOne({
      where: {
        id: req.params.id,
        tenant_id: req.tenantId
      }
    });

    if (!operator) {
      return res.status(404).json({ error: 'Operator not found' });
    }

    res.json(operator);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch operator' });
  }
});

// POST /api/operators - Create new operator
router.post('/', async (req, res) => {
  try {
    const { name, email, twilioNumber } = req.body;
    const tenantId = req.tenantId;

    if (!name || !email || !twilioNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const operator = await Operator.create({
      tenant_id: tenantId,
      name,
      email,
      twilio_number: twilioNumber,
      status: 'active'
    });

    res.status(201).json(operator);
  } catch (error) {
    console.error('Error creating operator:', error);
    res.status(500).json({ error: 'Failed to create operator' });
  }
});

// PUT /api/operators/:id - Update operator
router.put('/:id', async (req, res) => {
  try {
    const operator = await Operator.findOne({
      where: {
        id: req.params.id,
        tenant_id: req.tenantId
      }
    });

    if (!operator) {
      return res.status(404).json({ error: 'Operator not found' });
    }

    const { name, email, twilioNumber, status } = req.body;

    if (name) operator.name = name;
    if (email) operator.email = email;
    if (twilioNumber) operator.twilio_number = twilioNumber;
    if (status) operator.status = status;

    await operator.save();

    res.json(operator);
  } catch (error) {
    console.error('Error updating operator:', error);
    res.status(500).json({ error: 'Failed to update operator' });
  }
});

// DELETE /api/operators/:id - Delete operator
router.delete('/:id', async (req, res) => {
  try {
    const operator = await Operator.findOne({
      where: {
        id: req.params.id,
        tenant_id: req.tenantId
      }
    });

    if (!operator) {
      return res.status(404).json({ error: 'Operator not found' });
    }

    await operator.destroy();

    res.json({ success: true, message: 'Operator deleted' });
  } catch (error) {
    console.error('Error deleting operator:', error);
    res.status(500).json({ error: 'Failed to delete operator' });
  }
});

export default router;
