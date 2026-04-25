import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import { initializeDatabase } from './src/config/database.js';
import { Tenant, OutboundNumber, User } from './src/models/index.js';
import CallsService from './src/services/CallsService.js';
import TwilioService from './src/services/TwilioService.js';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Fail-fast: warn loudly if critical secrets are using insecure fallbacks
if (!process.env.JWT_SECRET) {
  console.error('[SECURITY] JWT_SECRET env var is not set — using insecure fallback. Set it in Railway immediately.');
}
if (!process.env.ENCRYPTION_KEY) {
  console.error('[SECURITY] ENCRYPTION_KEY env var is not set — Twilio credentials are encrypted with an all-zeros key.');
}

async function startServer() {
  try {
    await initializeDatabase(Tenant, OutboundNumber, User);
    console.log('Database initialized successfully');

    const cleaned = await CallsService.cleanupStaleCalls();
    if (cleaned > 0) console.log(`Cleaned up ${cleaned} stale call(s)`);

    // Setup Twilio Voice infrastructure (API Key + TwiML App)
    try {
      const { Tenant: TenantModel } = await import('./src/models/index.js');
      const tenant = await TenantModel.findByPk('00000000-0000-0000-0000-000000000001');
      if (tenant) await TwilioService.setupVoiceInfrastructure(tenant);
    } catch (e) {
      console.warn('Voice infrastructure setup failed (non-fatal):', e.message);
    }

    app.listen(PORT, () => {
      console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
