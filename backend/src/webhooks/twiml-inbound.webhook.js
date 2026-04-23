import express from 'express';
import { Tenant } from '../models/index.js';
import { validateTwilioSignature } from '../middleware/twilioSignature.js';

const router = express.Router();
const MASTER_TENANT_ID = '00000000-0000-0000-0000-000000000001';

// POST /api/webhooks/twiml/inbound
// Called by Twilio when a PSTN call arrives at a Twilio phone number.
// Routes the call to the browser client (Voice SDK).
router.post('/', validateTwilioSignature, async (req, res) => {
  res.set('Content-Type', 'text/xml');

  try {
    const tenant = await Tenant.findByPk(MASTER_TENANT_ID);
    // Identity must match what the browser registered with (email sanitized)
    const identity = 'hola_marketingkoraia_com';

    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial timeout="30" callerId="${req.body.From || '+584242987181'}">
    <Client>${identity}</Client>
  </Dial>
</Response>`);
  } catch (error) {
    console.error('Inbound TwiML error:', error);
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response><Say language="es-MX">Un momento por favor.</Say></Response>`);
  }
});

export default router;
