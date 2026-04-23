import express from 'express';
import { validateTwilioSignature } from '../middleware/twilioSignature.js';
import CallsService from '../services/CallsService.js';
import { Operator } from '../models/index.js';

const router = express.Router();
const CALLER_ID = '+584242987181';
const TENANT_ID = '00000000-0000-0000-0000-000000000001';

// Handle Dial action callback (call completion)
router.post('/status', validateTwilioSignature, async (req, res) => {
  res.set('Content-Type', 'text/xml');
  const { CallSid, DialCallStatus, DialCallDuration, RecordingUrl } = req.body;

  if (CallSid) {
    const statusMap = { completed: 'completed', busy: 'failed', 'no-answer': 'failed', failed: 'failed', canceled: 'failed' };
    const status = statusMap[DialCallStatus] ?? 'completed';
    await CallsService.updateCallEvent(CallSid, {
      status,
      duration: DialCallDuration ? parseInt(DialCallDuration) : 0,
      recordingUrl: RecordingUrl || null,
    }).catch(() => {});
  }

  res.send(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`);
});

router.post('/', validateTwilioSignature, async (req, res) => {
  res.set('Content-Type', 'text/xml');

  const to = req.body.To || req.query.To;

  if (!to) {
    return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response><Say language="es-MX">No se especificó destino.</Say></Response>`);
  }

  const dest = to.replace(/\s/g, '');
  const callSid = req.body.CallSid;

  // Log call to DB
  if (callSid) {
    const operator = await Operator.findOne({ where: { tenant_id: TENANT_ID } }).catch(() => null);
    await CallsService.recordCall({
      tenantId: TENANT_ID,
      operatorId: operator?.id ?? null,
      callSid,
      fromNumber: CALLER_ID,
      toNumber: dest,
    }).catch(() => {});
  }

  const baseUrl = process.env.BACKEND_URL || 'https://llamadas-venezuela-production.up.railway.app';

  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${CALLER_ID}" timeout="30"
        action="${baseUrl}/api/webhooks/twiml/app/status">
    <Number>${dest}</Number>
  </Dial>
</Response>`);
});

export default router;
