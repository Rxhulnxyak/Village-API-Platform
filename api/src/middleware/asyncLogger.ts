import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export const asyncLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const user = (req as any).user;
    if (!user) return; // Only log authenticated requests

    const duration = Date.now() - start;

    // Fire and forget log entry
    prisma.apiLog.create({
      data: {
        userId: user.id,
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: res.statusCode,
        responseTimeMs: duration,
        ipAddress: req.ip || req.headers['x-forwarded-for']?.toString(),
        cacheHit: (res as any).cacheHit || false,
      }
    }).catch(err => {
      console.error('Async Logger Failed:', err);
    });
  });

  next();
};
