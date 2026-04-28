# VillageAPI Setup Guide

## Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL client (`psql`)

## Installation
1. Install node dependencies:
   ```bash
   npm install
   ```

2. Set up NeonDB (PostgreSQL) and Upstash Redis.
3. Copy `.env.example` to `.env` and fill the variables.

## Database Initialization
1. Enable `pg_trgm` and `uuid-ossp` manually:
   ```bash
   psql $DIRECT_URL -f prisma/migrations/manual_extensions.sql
   ```

2. Run Prisma migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

3. Seed the database (creates admin and demo key):
   ```bash
   npx prisma db seed
   ```

## Data Import
1. Install Python dependencies:
   ```bash
   pip install -r scripts/requirements.txt
   ```
2. Run the import script on the dataset:
   ```bash
   python scripts/import_mdds.py --file "all-india-villages-master-list-excel/dataset"
   ```

## Starting the Project
Run Turborepo dev command:
```bash
npm run dev
```
- API: http://localhost:3000
- Admin Panel: http://localhost:5173
- B2B Portal: http://localhost:5174
- Demo App: http://localhost:5175
