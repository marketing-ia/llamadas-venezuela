import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import { initializeDatabase } from './src/config/database.js';
import { Tenant, OutboundNumber, User } from './src/models/index.js';
import CallsService from './src/services/CallsService.js';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    await initializeDatabase(Tenant, OutboundNumber, User);
    console.log('Database initialized successfully');

    const cleaned = await CallsService.cleanupStaleCalls();
    if (cleaned > 0) console.log(`Cleaned up ${cleaned} stale call(s)`);

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
