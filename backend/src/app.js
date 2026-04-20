import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { tenancyMiddleware } from './middleware/tenancy.js';
import authRoutes from './routes/auth.routes.js';
import callsRoutes from './routes/calls.routes.js';
import operatorsRoutes from './routes/operators.routes.js';
import scriptsRoutes from './routes/scripts.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import twilioWebhook from './webhooks/twilio.webhook.js';
import twimlWebhook from './webhooks/twiml.webhook.js';

dotenv.config();

const app = express();

// Trust Railway's proxy so rate-limiter can resolve real client IPs
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Unauthenticated routes (no tenancy middleware)
app.use('/api/auth', authRoutes);
app.use('/api/webhooks/twilio', twilioWebhook);
app.use('/api/webhooks/twiml', twimlWebhook);

// Tenancy middleware for protected routes
app.use('/api/', tenancyMiddleware);

// Protected API routes
app.use('/api/calls', callsRoutes);
app.use('/api/operators', operatorsRoutes);
app.use('/api/scripts', scriptsRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    status,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;
