import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const router = Router();

// Middleware to verify B2B user (applied in app.ts)

router.get('/profile', async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, businessName: true, planType: true, status: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.get('/keys', async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch keys' });
  }
});

router.post('/keys', async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { name } = req.body;
  
  try {
    const rawKey = 'ak_' + uuidv4().replace(/-/g, '');
    const rawSecret = uuidv4().replace(/-/g, '');
    const secretHash = await bcrypt.hash(rawSecret, 10);

    const apiKey = await prisma.apiKey.create({
      data: {
        id: uuidv4(),
        key: rawKey,
        secretHash,
        name: name || 'Default Key',
        userId,
        isActive: true
      }
    });

    // We only show the secret ONCE
    res.status(201).json({ 
      ...apiKey,
      secret: rawSecret 
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create API key' });
  }
});

router.delete('/keys/:id', async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  
  try {
    await prisma.apiKey.delete({
      where: { id, userId }
    });
    res.json({ message: 'Key deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete key' });
  }
});

router.get('/usage', async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  try {
    const logs = await prisma.apiLog.findMany({
      where: { userId },
      take: 50,
      orderBy: { createdAt: 'desc' }
    });
    
    const stats = await prisma.apiLog.groupBy({
      by: ['method'],
      where: { userId },
      _count: { _all: true }
    });

    res.json({ logs, stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch usage' });
  }
});

export default router;
