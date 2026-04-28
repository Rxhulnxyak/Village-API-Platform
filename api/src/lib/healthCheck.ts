import { Request, Response } from 'express';
import { prisma } from './prisma';
import { checkRedisHealth } from './redis';

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    let dbStatus = 'error';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'ok';
    } catch (e) {}

    const redisStatus = await checkRedisHealth() ? 'ok' : 'error';

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: dbStatus,
        redis: redisStatus
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error' });
  }
};
