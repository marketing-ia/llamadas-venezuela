import express from 'express';
import { validateTwilioSignature } from '../middleware/twilioSignature.js';

const router = express.Router();
const CALLER_ID = '+584242987181';

router.post('/', validateTwilioSignature, (req, res) => {
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
