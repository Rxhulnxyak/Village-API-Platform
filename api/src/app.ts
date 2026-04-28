import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import { securityHeaders } from './middleware/securityHeaders';
import { perfMonitor } from './middleware/perfMonitor';
import { asyncLogger } from './middleware/asyncLogger';
import { rateLimiter } from './middleware/rateLimiter';
import { apiKeyAuth } from './middleware/apiKeyAuth';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import geoRoutes from './routes/geo';
import b2bAuthRoutes from './routes/b2bAuth';
import adminAuthRoutes from './routes/adminAuth';
import adminRoutes from './routes/adminRoutes';
import b2bRoutes from './routes/b2bRoutes';
import docsRoutes from './routes/docs';
import { adminAuth } from './middleware/adminAuth';
import { b2bAuth } from './middleware/b2bAuth';
import { healthCheck } from './lib/healthCheck';

const app = express();


// 1. requestId middleware
app.use((req, res, next) => {
  (req as any).requestId = uuidv4();
  next();
});

// 2. perfMonitor
app.use(perfMonitor);

// 3. securityHeaders
app.use(securityHeaders);

// 4. helmet
app.use(helmet());

// 5. cors
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));

// 6. express.json with limit to prevent large payload attacks
app.use(express.json({ limit: '10kb' }));

// 7. express.urlencoded
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 10. Mount Public Auth Routes (No protection)
app.use('/v1/admin/auth', adminAuthRoutes);
app.use('/v1/b2b/auth', b2bAuthRoutes);

// 11. Health check (no auth)
app.get('/health', healthCheck);
app.use('/v1/docs', docsRoutes);

// 12. Apply auth and rate limit for API routes
app.use('/v1/search', apiKeyAuth as express.RequestHandler, rateLimiter as express.RequestHandler, asyncLogger as express.RequestHandler);
app.use('/v1/states', apiKeyAuth as express.RequestHandler, rateLimiter as express.RequestHandler, asyncLogger as express.RequestHandler);
app.use('/v1/districts', apiKeyAuth as express.RequestHandler, rateLimiter as express.RequestHandler, asyncLogger as express.RequestHandler);
app.use('/v1/subdistricts', apiKeyAuth as express.RequestHandler, rateLimiter as express.RequestHandler, asyncLogger as express.RequestHandler);
app.use('/v1/autocomplete', apiKeyAuth as express.RequestHandler, rateLimiter as express.RequestHandler, asyncLogger as express.RequestHandler);

// 13. Mount Protected Routes
app.use('/v1', geoRoutes);
app.use('/v1/admin', adminAuth as express.RequestHandler, adminRoutes);
app.use('/v1/b2b', b2bAuth as express.RequestHandler, b2bRoutes);

// 16. errorHandler
app.use(errorHandler);

export default app;
