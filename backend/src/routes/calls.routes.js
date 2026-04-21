import express from 'express';
import TwilioService from '../services/TwilioService.js';
import CallsService from '../services/CallsService.js';
import { operatorCallLimiter } from '../middleware/rateLimit.js';
import { validatePhoneNumber } from '../utils/validation.js';
import { trialLimitsMiddleware, incrementTrialCalls } from '../middleware/trialLimits.js';

const router = express.Router();

// POST /api/calls/initiate
router.post('/initiate', operatorCallLimiter, trialLimitsMiddleware, async (req, res) => {
  try {
    const { operatorId, toNumber } = req.body;
    const tenantId = req.tenantId;

    if (!operatorId || !toNumber) {
      return res.status(400).json({ error: 'Missing operatorId or toNumber' });
    }
    if (!validatePhoneNumber(toNumber)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    const call = await TwilioService.initiateCall(tenantId, operatorId, toNumber);

    await CallsService.recordCall({
      tenantId,
      operatorId,
      callSid: call.callSid,
      fromNumber: call.from,
      toNumber: call.to
    });

    // Track trial call usage
    if (req.user?.role === 'trial') {
      await incrementTrialCalls(req.user.userId);
    }

    res.json(call);
  } catch (error) {
    console.error('Error initiating call:', error);
    res.status(500).json({ error: 'Failed to initiate call' });
  }
});

// GET /api/calls/logs
router.get('/logs', async (req, res) => {
  try {
    const { operatorId, startDate, endDate, status, limit, offset } = req.query;
    const tenantId = req.tenantId;
    const filters = {
      operatorId: operatorId || null,
      startDate: startDate || null,
      endDate: endDate || null,
      status: status || null,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0
    };
    const result = await CallsService.getCallLogs(tenantId, filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
});

// GET /api/calls/:id
router.get('/:id', async (req, res) => {
  try {
    const call = await CallsService.getCallById(req.tenantId, req.params.id);
    if (!call) return res.status(404).json({ error: 'Call not found' });
    res.json(call);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch call' });
  }
});

export default router;
