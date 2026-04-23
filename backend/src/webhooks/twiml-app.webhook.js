import express from 'express';

const router = express.Router();
const CALLER_ID = '+584242987181';
const SIP_TRUNK = 'romaia.pstn.twilio.com';

// POST /api/webhooks/twiml/app
// Called by Twilio Voice SDK when the browser client initiates a call.
// `To` = destination number entered by the operator.
router.post('/', (req, res) => {
  res.set('Content-Type', 'text/xml');

  const to = req.body.To || req.query.To;

  if (!to) {
    return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response><Say language="es-MX">No se especificó destino.</Say></Response>`);
  }

  // Sanitize number — strip spaces, ensure E.164
  const dest = to.replace(/\s/g, '');

  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${CALLER_ID}" timeout="30">
    <Sip>${dest}@${SIP_TRUNK}</Sip>
  </Dial>
</Response>`);
});

export default router;
