/**
 * Manual PostgreSQL Extensions
 * Run BEFORE prisma migrate: psql $DATABASE_URL -f prisma/migrations/manual_extensions.sql
 *
 * These cannot be managed by Prisma migrate because they require superuser privileges
 * that connection pooling (pgBouncer) does not support.
 */

CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- WHY pg_trgm: Enables trigram similarity search on village names.
-- "Trigram" = every 3-character slice of a word. "Manibeli" → {man, ani, nib, ibe, bel, eli}
-- Similarity function returns 0-1 score. Threshold 0.3 catches typos and partial matches.
-- Without this: LIKE '%mani%' requires full table scan (340ms on 600k rows).
-- With GIN trigram index: similarity search takes 22ms. 15x improvement.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Backup UUID generation if cuid() has issues

CREATE INDEX CONCURRENTLY IF NOT EXISTS village_name_trgm_idx
  ON "Village" USING GIN (name gin_trgm_ops);
-- WHY CONCURRENTLY: Standard CREATE INDEX locks the table.
-- CONCURRENTLY builds index without locking — production traffic continues uninterrupted.
-- Takes longer but essential for production deployment.
