import express from 'express';
import { CallRecord, Operator } from '../models/index.js';

const router = express.Router();

// POST /api/webhooks/twiml - Return TwiML instructions for an outbound call
// Twilio calls this URL when the called party answers.
// We look up which operator initiated the call and bridge to their SIP URI.
router.post('/', async (req, res) => {
  const { CallSid } = req.body;

  res.set('Content-Type', 'text/xml');

  try {
    if (!CallSid) {
      return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response><Say language="es-MX">Bienvenido, un momento por favor.</Say></Response>`);
    }

    const callRecord = await CallRecord.findOne({
      where: { twilio_call_sid: CallSid },
      include: [{ model: Operator, attributes: ['sip_uri'] }]
    });

    if (!callRecord || !callRecord.Operator?.sip_uri) {
      return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response><Say language="es-MX">Bienvenido, un momento por favor.</Say></Response>`);
    }

    const sipUri = callRecord.Operator.sip_uri;

    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="+584242987181">
    <Sip>${sipUri}</Sip>
  </Dial>
</Response>`);
  } catch (error) {
    console.error('Error generating TwiML:', error);
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response><Say language="es-MX">Bienvenido, un momento por favor.</Say></Response>`);
  }
});

export default router;
