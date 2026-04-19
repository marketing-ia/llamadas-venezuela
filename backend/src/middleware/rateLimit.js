import rateLimit from 'express-rate-limit';

export const operatorCallLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 calls per minute per operator
  keyGenerator: (req) => `${req.tenantId}-${req.body.operatorId}`,
  message: 'Too many calls, please try again later'
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per 15 minutes per tenant
});
