import express from 'express';
import { OutboundNumber } from '../models/index.js';

const router = express.Router();

const TENANT_ID = '00000000-0000-0000-0000-000000000001';
const MAX_SLOTS = 4;

// GET /api/numbers - List all 4 slots (filled or empty)
router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenantId || TENANT_ID;
    const numbers = await OutboundNumber.findAll({
      where: { tenant_id: tenantId },
      order: [['slot', 'ASC']]
    });

    // Always return 4 slots, empty ones as null
    const slots = Array.from({ length: MAX_SLOTS }, (_, i) => {
      const slot = i + 1;
      return numbers.find(n => n.slot === slot) || { slot, phone_number: null, label: null, is_active: false, id: null };
    });

    res.json(slots);
  } catch (error) {
    console.error('Error fetching numbers:', error);
    res.status(500).json({ error: 'Failed to fetch phone numbers' });
  }
});

// PUT /api/numbers/:slot - Set or update a slot (1–4)
router.put('/:slot', async (req, res) => {
  try {
    const tenantId = req.tenantId || TENANT_ID;
    const slot = parseInt(req.params.slot);

    if (slot < 1 || slot > MAX_SLOTS) {
      return res.status(400).json({ error: `Slot must be between 1 and ${MAX_SLOTS}` });
    }

    const { phone_number, label, is_active } = req.body;

    if (!phone_number) {
      return res.status(400).json({ error: 'phone_number is required' });
    }

    const [record, created] = await OutboundNumber.findOrCreate({
      where: { tenant_id: tenantId, slot },
      defaults: { phone_number, label, is_active: is_active !== false }
    });

    if (!created) {
      await record.update({ phone_number, label, is_active: is_active !== false });
    }

    res.json(record);
  } catch (error) {
    console.error('Error updating number:', error);
    res.status(500).json({ error: 'Failed to update phone number' });
  }
});

// DELETE /api/numbers/:slot - Clear a slot
router.delete('/:slot', async (req, res) => {
  try {
    const tenantId = req.tenantId || TENANT_ID;
    const slot = parseInt(req.params.slot);

    if (slot === 1) {
      return res.status(400).json({ error: 'Cannot delete slot 1 (primary number)' });
    }

    await OutboundNumber.destroy({ where: { tenant_id: tenantId, slot } });
    res.json({ message: `Slot ${slot} cleared` });
  } catch (error) {
    console.error('Error deleting number:', error);
    res.status(500).json({ error: 'Failed to delete phone number' });
  }
});

// PATCH /api/numbers/:slot/toggle - Activate / deactivate
router.patch('/:slot/toggle', async (req, res) => {
  try {
    const tenantId = req.tenantId || TENANT_ID;
    const slot = parseInt(req.params.slot);

    const record = await OutboundNumber.findOne({ where: { tenant_id: tenantId, slot } });
    if (!record) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    await record.update({ is_active: !record.is_active });
    res.json(record);
  } catch (error) {
    console.error('Error toggling number:', error);
    res.status(500).json({ error: 'Failed to toggle number' });
  }
});

export default router;
