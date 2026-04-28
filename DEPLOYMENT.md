# VillageAPI Deployment Guide

## Production Architecture
- **Backend:** Node.js serverless functions hosted on Vercel Edge Network.
- **Database:** NeonDB serverless PostgreSQL.
- **Cache & Rate Limiting:** Upstash serverless Redis.
- **Frontend:** Static React bundles hosted on Vercel CDN.

## Deployment Steps
1. Push to GitHub.
2. Import project in Vercel.
3. Set root directory to `.`.
4. Build command: `npm run build`
5. Output directory is managed by Vercel for Turborepo.
6. Configure all environment variables in Vercel.

## Scaling
Vercel serverless functions auto-scale from 0 to 1000s of instances.
NeonDB connection pooling (via `DATABASE_URL`) ensures we don't exhaust Postgres connection limits.
