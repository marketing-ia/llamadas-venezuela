import express from 'express';
import CallsService from '../services/CallsService.js';
import { validateTwilioSignature } from '../middleware/twilioSignature.js';

const router = express.Router();

router.post('/', validateTwilioSignature, async (req, res) => {
  try {
    const { CallSid, CallStatus, RecordingUrl, Duration, Price } = req.body;

    if (!CallSid) {
      return res.status(400).json({ error: 'Missing CallSid' });
    }

    // Price from Twilio statusCallback is the total charge (negative number), e.g. "-0.0135"
    await CallsService.updateCallEvent(CallSid, {
      status: CallStatus,
      duration: Duration ? parseInt(Duration) : null,
      totalCost: Price ? Math.abs(parseFloat(Price)) : null,
      recordingUrl: RecordingUrl || null
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error handling Twilio webhook:', error);
    res.status(200).json({ success: false }); // Always 200 to Twilio
  }
});

export default router;
