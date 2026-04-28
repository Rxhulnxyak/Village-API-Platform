import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { redis, withCache } from '../lib/redis';

const router = Router();

// Cache TTLs
const CACHE_TTL = {
  STATES: 3600 * 24, // 24 hours
  DISTRICTS: 3600 * 12,
  SUBDISTRICTS: 3600 * 6,
  VILLAGES: 3600,
  SEARCH: 1800
};

// 1. Get All States
router.get('/states', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const states = await withCache('all_states', CACHE_TTL.STATES, async () => {
      return prisma.state.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, mddsCode: true, name: true }
      });
    });
    res.json(states);
  } catch (error) {
    next(error);
  }
});

// 2. Get Districts by State ID
router.get('/districts/:stateId', async (req: Request, res: Response, next: NextFunction) => {
  const { stateId } = req.params;
  try {
    const districts = await withCache(`districts:${stateId}`, CACHE_TTL.DISTRICTS, async () => {
      return prisma.district.findMany({
        where: { stateId },
        orderBy: { name: 'asc' },
        select: { id: true, mddsCode: true, name: true }
      });
    });
    res.json(districts);
  } catch (error) {
    next(error);
  }
});

// 3. Get SubDistricts by District ID
router.get('/subdistricts/:districtId', async (req: Request, res: Response, next: NextFunction) => {
  const { districtId } = req.params;
  try {
    const subDistricts = await withCache(`subdistricts:${districtId}`, CACHE_TTL.SUBDISTRICTS, async () => {
      return prisma.subDistrict.findMany({
        where: { districtId },
        orderBy: { name: 'asc' },
        select: { id: true, mddsCode: true, name: true }
      });
    });
    res.json(subDistricts);
  } catch (error) {
    next(error);
  }
});

// 4. Get Villages by SubDistrict ID
router.get('/villages/:subDistrictId', async (req: Request, res: Response, next: NextFunction) => {
  const { subDistrictId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const skip = (page - 1) * limit;

  try {
    const cacheKey = `villages:${subDistrictId}:${page}:${limit}`;
    const data = await withCache(cacheKey, CACHE_TTL.VILLAGES, async () => {
      const [villages, total] = await Promise.all([
        prisma.village.findMany({
          where: { subDistrictId },
          orderBy: { name: 'asc' },
          skip,
          take: limit,
          select: { id: true, mddsPlcn: true, name: true }
        }),
        prisma.village.count({ where: { subDistrictId } })
      ]);
      return { villages, total, page, totalPages: Math.ceil(total / limit) };
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// 5. Fuzzy Search for Villages
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  const query = req.query.q as string;
  if (!query || query.length < 3) {
    return res.status(400).json({ error: 'Query must be at least 3 characters' });
  }

  try {
    const parts = query.split(',').map(p => p.trim());
    const mainQuery = parts[0];
    const subQuery = parts.length > 1 ? parts[1] : null;

    // WHY RAW SQL: Prisma does not support pg_trgm similarity directly.
    // Optimization: We use GREATEST to score based on name match AND hierarchy match.
    const villages = await prisma.$queryRaw`
      SELECT v.id, v."mddsPlcn", v.name, sd.name as "subDistrict", d.name as "district", s.name as "state",
             (
                similarity(v.name, ${mainQuery}) * 1.5 + 
                CASE WHEN CAST(${subQuery} AS TEXT) IS NOT NULL AND (s.name ILIKE '%' || CAST(${subQuery} AS TEXT) || '%' OR d.name ILIKE '%' || CAST(${subQuery} AS TEXT) || '%') THEN 1.0 ELSE 0 END +
                CASE WHEN s.name ILIKE '%' || ${mainQuery} || '%' THEN 0.5 ELSE 0 END +
                CASE WHEN d.name ILIKE '%' || ${mainQuery} || '%' THEN 0.4 ELSE 0 END
             ) as score
      FROM "Village" v
      JOIN "SubDistrict" sd ON v."subDistrictId" = sd.id
      JOIN "District" d ON sd."districtId" = d.id
      JOIN "State" s ON d."stateId" = s.id
      WHERE (v.name % ${mainQuery})
         OR (s.name ILIKE '%' || ${mainQuery} || '%')
         OR (CAST(${subQuery} AS TEXT) IS NOT NULL AND (s.name ILIKE '%' || CAST(${subQuery} AS TEXT) || '%' OR d.name ILIKE '%' || CAST(${subQuery} AS TEXT) || '%'))
      ORDER BY score DESC
      LIMIT 25
    `;
    res.json(villages);
  } catch (error) {
    next(error);
  }
});

// 6. Autocomplete (Prefix Search)
router.get('/autocomplete', async (req: Request, res: Response, next: NextFunction) => {
  const query = req.query.q as string;
  if (!query) return res.json([]);

  try {
    const villages = await prisma.village.findMany({
      where: {
        name: {
          startsWith: query,
          mode: 'insensitive'
        }
      },
      take: 10,
      select: {
        id: true,
        name: true,
        subDistrict: {
          select: {
            name: true,
            district: {
              select: {
                name: true,
                state: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    });
    res.json(villages);
  } catch (error) {
    next(error);
  }
});

export default router;
