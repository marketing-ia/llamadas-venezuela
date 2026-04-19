export function tenancyMiddleware(req, res, next) {
  // Extract tenant_id from session or JWT
  // For now, simple approach: pass via header or session
  const tenantId = req.headers['x-tenant-id'] || req.session?.tenantId;

  if (!tenantId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.tenantId = tenantId;
  next();
}
