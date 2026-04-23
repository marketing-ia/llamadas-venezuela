import rateLimit from 'express-rate-limit';

export const operatorCallLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => `${req.tenantId}-${req.body.operatorId}`,
  message: 'Too many calls, please try again later'
});

// 5 login attempts per 15 minutes per IP — brute-force protection
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos de inicio de sesión. Espera 15 minutos.' },
  skipSuccessfulRequests: true
});
