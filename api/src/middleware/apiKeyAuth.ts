import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  const apiSecret = req.headers['x-api-secret'] as string;

  if (!apiKey || !apiSecret) {
    return res.status(401).json({ error: 'Missing API Key or Secret' });
  }

  try {
    // 1. Fetch key record with user and state access
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { 
        user: {
          include: {
            stateAccess: true
          }
        } 
      },
    });

    if (!keyRecord || !keyRecord.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive API Key' });
    }

    // 2. Verify hashed secret
    const isValidSecret = await bcrypt.compare(apiSecret, keyRecord.secretHash);
    if (!isValidSecret) {
      return res.status(401).json({ error: 'Invalid API Secret' });
    }

    // 3. Attach user and permissions to request
    (req as any).user = keyRecord.user;
    (req as any).planType = keyRecord.user.planType;
    (req as any).allowedStateIds = keyRecord.user.stateAccess.map(sa => sa.stateId);

    // 4. Update lastUsedAt is disabled to prevent connection pool exhaustion during burst requests.
    // The asyncLogger already tracks API usage.

    next();
  } catch (error) {
    console.error('API Auth Error:', error);
    next(error);
  }
};
