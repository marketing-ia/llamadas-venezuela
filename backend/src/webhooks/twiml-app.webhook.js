import express from 'express';

const router = express.Router();
const CALLER_ID = '+584242987181';

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

  const dest = to.replace(/\s/g, '');

  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${CALLER_ID}" timeout="30">
    <Number>${dest}</Number>
  </Dial>
</Response>`);
});

export default router;
