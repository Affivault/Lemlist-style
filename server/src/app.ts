import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { routes } from './routes/index.js';
import { assetController } from './controllers/asset.controller.js';
import { webhookInboundRoutes } from './routes/webhook-inbound.routes.js';
import { trackingRoutes } from './routes/tracking.routes.js';

const app = express();

// Middleware
app.use(helmet());

// CORS — allow CLIENT_URL and Vercel preview deployments
const allowedOrigins = [
  env.CLIENT_URL,
  env.CLIENT_URL.replace(/\/$/, ''), // without trailing slash
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (health checks, server-to-server)
    if (!origin) return callback(null, true);
    // Check exact match or Vercel preview URLs for the same project
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    console.warn('CORS blocked origin:', origin);
    callback(null, false);
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Public asset render endpoint (no auth - used in email images)
app.get('/api/assets/render/:templateId', assetController.render);

// Public inbound webhook endpoint (no auth - external systems call this)
app.use('/api/webhooks/inbound', webhookInboundRoutes);

// Public tracking endpoints (no auth - used in email opens/clicks)
app.use('/api/track', trackingRoutes);

// Routes (authenticated)
app.use('/api/v1', routes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorMiddleware);

export { app };
