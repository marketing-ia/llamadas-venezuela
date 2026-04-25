import express from 'express';
import { validateTwilioSignature } from '../middleware/twilioSignature.js';
import CallsService from '../services/CallsService.js';
import { Operator, Tenant } from '../models/index.js';
import { getTwilioClientByTenant } from '../config/twilio.js';

const router = express.Router();
const CALLER_ID = process.env.CALLER_ID || '+584242987181';
const TENANT_ID = '00000000-0000-0000-0000-000000000001';

// Handle Dial action callback (call completion)
// No signature validation here — a 403 would leave the browser leg stuck open indefinitely
router.post('/status', async (req, res) => {
  res.set('Content-Type', 'text/xml');
  // Respond immediately so Twilio can hang up the browser leg
  res.send(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`);

  // Update DB in background after response is sent
  const { CallSid, DialCallSid, DialCallStatus, DialCallDuration, RecordingUrl } = req.body;
  if (CallSid) {
    const statusMap = { completed: 'completed', busy: 'failed', 'no-answer': 'failed', failed: 'failed', canceled: 'failed' };
    const status = statusMap[DialCallStatus] ?? 'completed';

    // Fetch actual price from Twilio API — not available in the action callback directly
    let totalCost = null;
    if (DialCallSid) {
      try {
        // Wait briefly for Twilio billing to finalize
        await new Promise(r => setTimeout(r, 3000));
        const tenant = await Tenant.findByPk(TENANT_ID);
        const client = getTwilioClientByTenant(tenant);
        const call = await client.calls(DialCallSid).fetch();
        if (call.price) totalCost = Math.abs(parseFloat(call.price));
      } catch { /* non-fatal — cost stays null */ }
    }

    CallsService.updateCallEvent(CallSid, {
      status,
      duration: DialCallDuration ? parseInt(DialCallDuration) : 0,
      totalCost,
      recordingUrl: RecordingUrl || null,
    }).catch(() => {});
  }
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
  const baseUrl = process.env.BACKEND_URL || 'https://llamadas-venezuela-production.up.railway.app';

  // Respond with TwiML immediately — DB logging runs in background
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${CALLER_ID}" timeout="30"
        action="${baseUrl}/api/webhooks/twiml/app/status">
    <Number>${dest}</Number>
  </Dial>
</Response>`);

  // Fire-and-forget: log to DB after TwiML is already on its way to Twilio
  if (callSid) {
    Operator.findOne({ where: { tenant_id: TENANT_ID } })
      .then(operator => CallsService.recordCall({
        tenantId: TENANT_ID,
        operatorId: operator?.id ?? null,
        callSid,
        fromNumber: CALLER_ID,
        toNumber: dest,
      }))
      .catch(() => {});
  }
});

export default router;
