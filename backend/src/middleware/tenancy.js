export function tenancyMiddleware(req, res, next) {
  const tenantId = req.user?.tenantId;
  if (!tenantId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.tenantId = tenantId;
  next();
}
