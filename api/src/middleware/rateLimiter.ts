import { Request, Response, NextFunction } from 'express';
import { redis } from '../lib/redis';

const LIMITS: Record<string, number> = {
  'FREE': 10,       // 10 requests per minute
  'PREMIUM': 100,   // 100 requests per minute
  'PRO': 500,       // 500 requests per minute
  'UNLIMITED': 5000 // 5000 requests per minute
};

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  if (!redis) {
    // If Redis is not available, fail open in development, but maybe fail closed in prod
    return next();
  }

  const user = (req as any).user;
  const planType = (req as any).planType || 'FREE';
  const limit = LIMITS[planType] || LIMITS['FREE'];
  
  const userId = user?.id || req.ip; // Fallback to IP if no user
  const key = `ratelimit:${userId}`;

  try {
    const current = await redis.incr(key);
    
    if (current === 1) {
      // First request in the window, set expiry
      await redis.expire(key, 60);
    }

    const remaining = Math.max(0, limit - current);
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (current > limit) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded for ${planType} plan. Limit is ${limit} req/min.`,
        retryAfter: 60
      });
    }

    next();
  } catch (error) {
    console.error('Rate Limiter Error:', error);
    next(); // Fail open on Redis errors to prevent downtime
  }
};
