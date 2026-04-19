export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ error: 'Internal server error' });
  }

  res.status(err.status || 500).json({
    error: err.message,
    stack: err.stack
  });
}
