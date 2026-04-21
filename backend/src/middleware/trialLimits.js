import { User } from '../models/index.js';

export async function trialLimitsMiddleware(req, res, next) {
  const role = req.session?.role;
  const userId = req.session?.userId;

  if (role !== 'trial' || !userId) return next();

  try {
    const user = await User.findByPk(userId, {
      attributes: ['trial_expires_at', 'max_calls', 'calls_used', 'is_active']
    });

    if (!user || !user.is_active) {
      return res.status(403).json({ error: 'Cuenta desactivada' });
    }
    if (user.trial_expires_at && new Date(user.trial_expires_at) < new Date()) {
      return res.status(403).json({
        error: 'Tu período de prueba ha expirado',
        code: 'TRIAL_EXPIRED'
      });
    }
    if (user.max_calls !== null && user.calls_used >= user.max_calls) {
      return res.status(403).json({
        error: `Has alcanzado el límite de ${user.max_calls} llamadas de prueba`,
        code: 'CALL_LIMIT_REACHED'
      });
    }

    next();
  } catch (error) {
    console.error('Trial limits check failed:', error);
    next(); // fail open so legitimate errors don't block master
  }
}

export async function incrementTrialCalls(userId) {
  if (!userId) return;
  try {
    await User.increment('calls_used', { where: { id: userId, role: 'trial' } });
  } catch (error) {
    console.error('Failed to increment trial calls_used:', error);
  }
}
