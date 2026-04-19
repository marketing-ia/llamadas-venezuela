import express from 'express';
import CallsService from '../services/CallsService.js';

const router = express.Router();

// POST /api/webhooks/twilio - Handle Twilio events
router.post('/', async (req, res) => {
  try {
    const { CallSid, CallStatus, RecordingUrl, Duration, Price } = req.body;

    if (!CallSid) {
      return res.status(400).json({ error: 'Missing CallSid' });
    }

    // Update call record with event data
    await CallsService.updateCallEvent(CallSid, {
      status: CallStatus,
      duration: Duration ? parseInt(Duration) : null,
      price: Price ? parseFloat(Price) : null,
      recordingUrl: RecordingUrl || null
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error handling Twilio webhook:', error);
    res.status(200).json({ success: false }); // Always 200 to Twilio
  }
});

export default router;
