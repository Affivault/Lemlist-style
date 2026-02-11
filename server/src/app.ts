import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorMiddleware } from './middleware/error.middleware.js';
import { routes } from './routes/index.js';
import { assetController } from './controllers/asset.controller.js';
import { webhookInboundRoutes } from './routes/webhook-inbound.routes.js';
import { trackingRoutes } from './routes/tracking.routes.js';

const app = express();

// Middleware
app.use(helmet());

// CORS — reflect any origin (all routes require JWT auth so this is safe)
app.use(cors({ origin: true, credentials: true }));
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

// Health check with diagnostics
app.get('/health', async (_req, res) => {
  const diagnostics: Record<string, string> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: 'direct-send-v2',
  };

  // Check Redis
  try {
    const { redisConnection } = await import('./config/redis.js');
    if (redisConnection.status === 'ready') {
      diagnostics.redis = 'connected';
    } else {
      diagnostics.redis = `status: ${redisConnection.status}`;
    }
  } catch (err: any) {
    diagnostics.redis = `error: ${err.message}`;
  }

  res.json(diagnostics);
});

// Error handler (must be last)
app.use(errorMiddleware);

export { app };
