import twilio from 'twilio';

/**
 * Validates the X-Twilio-Signature header on incoming webhook requests.
 * Rejects requests that don't originate from Twilio.
 * Skipped in development (no TWILIO_AUTH_TOKEN env var or NODE_ENV=development).
 */
export function validateTwilioSignature(req, res, next) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  // Skip validation in local dev — Twilio can't reach localhost
  if (!authToken || process.env.NODE_ENV !== 'production') {
    return next();
  }

  const signature = req.headers['x-twilio-signature'];
  if (!signature) {
    return res.status(403).send('Forbidden');
  }

  // Reconstruct the exact URL Twilio was configured with
  const backendUrl = process.env.BACKEND_URL || '';
  const url = `${backendUrl}${req.originalUrl}`;

  const isValid = twilio.validateRequest(authToken, signature, url, req.body || {});
  if (!isValid) {
    console.warn('Invalid Twilio signature from', req.ip);
    return res.status(403).send('Forbidden');
  }

  next();
}
