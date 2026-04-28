import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Middleware to verify admin JWT (skipped for brevity, but should be applied in app.ts)

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [userCount, requestCount, avgResponseTime] = await Promise.all([
      prisma.user.count(),
      prisma.apiLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.apiLog.aggregate({
        _avg: { responseTimeMs: true }
      })
    ]);

    res.json({
      totalUsers: userCount,
      totalRequestsToday: requestCount,
      avgResponseTime: Math.round(avgResponseTime._avg.responseTimeMs || 0),
      errorRate: 0.02 // Placeholder
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/charts/requests', async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 7;
  try {
    const logs = await prisma.apiLog.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      },
      _count: { _all: true },
      _avg: { responseTimeMs: true },
      orderBy: { createdAt: 'asc' }
    });

    // Grouping by date in JS since Prisma groupBy by createdAt is exact timestamp
    const grouped = logs.reduce((acc: any, log) => {
      const date = log.createdAt.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = { date, requests: 0, avgResponseTime: 0, count: 0 };
      acc[date].requests += log._count._all;
      acc[date].avgResponseTime += (log._avg.responseTimeMs || 0) * log._count._all;
      acc[date].count += log._count._all;
      return acc;
    }, {});

    const result = Object.values(grouped).map((g: any) => ({
      date: g.date,
      requests: g.requests,
      avgResponseTime: Math.round(g.avgResponseTime / g.count)
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

router.get('/top-states', async (req: Request, res: Response) => {
  try {
    const stats = await prisma.village.groupBy({
      by: ['subDistrictId'],
      _count: { _all: true }
    });

    // This is complex in Prisma if we want to join states.
    // Better to use raw SQL for performance on 600k rows.
    const result = await prisma.$queryRaw`
      SELECT s.name as state, COUNT(v.id)::int as count
      FROM "Village" v
      JOIN "SubDistrict" sd ON v."subDistrictId" = sd.id
      JOIN "District" d ON sd."districtId" = d.id
      JOIN "State" s ON d."stateId" = s.id
      GROUP BY s.name
      ORDER BY count DESC
      LIMIT 10
    `;

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top states' });
  }
});

router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { _count: { select: { apiKeys: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = await prisma.user.groupBy({
      by: ['planType'],
      _count: { _all: true }
    });

    const result = plans.map(p => ({
      name: p.planType,
      value: p._count._all
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plan distribution' });
  }
});

router.post('/users/:userId/status', async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { status } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status }
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update user status' });
  }
});

export default router;
