export function tenancyMiddleware(req, res, next) {
  const tenantId = req.user?.tenantId || req.headers['x-tenant-id'];
  if (!tenantId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.tenantId = tenantId;
  next();
}
