/**
 * Redis Client (Upstash via REST SDK)
 *
 * WHY REST SDK over ioredis:
 * Standard Redis (TCP) requires persistent connections — problematic in serverless
 * environments where connections are capped and not recycled.
 * Upstash REST SDK uses HTTP, making it stateless and perfect for serverless.
 */

import { Redis } from '@upstash/redis';

const PROD_DB = "postgresql://neondb_owner:npg_2FBmEL5ahXPW@ep-proud-violet-anpv4637-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";

export const redis = (process.env.REDIS_URL || "https://huge-cow-69321.upstash.io") && (process.env.REDIS_TOKEN || "gQAAAAAAAQ7JAAIgcDFjNTY1NmI2YjNjMjk0N2RkYjM3ODg5Y2FhODY2MDY0Mw")
  ? new Redis({
      url: process.env.REDIS_URL || "https://huge-cow-69321.upstash.io",
      token: process.env.REDIS_TOKEN || "gQAAAAAAAQ7JAAIgcDFjNTY1NmI2YjNjMjk0N2RkYjM3ODg5Y2FhODY2MDY0Mw",
    })
  : null;

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const data = await redis.get<T>(key);
    return data || null;
  } catch (error) {
    console.warn(`Redis get error for key ${key}:`, error);
    return null;
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch (error) {
    console.warn(`Redis set error for key ${key}:`, error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (error) {
    console.warn(`Redis del error for key ${key}:`, error);
  }
}

export async function deleteCacheByPattern(pattern: string): Promise<number> {
  if (!redis) return 0;
  // Note: Upstash REST doesn't support SCAN in the same way as ioredis, 
  // but we can use their 'keys' method or just handle it if pattern is simple.
  // For safety, let's use 'keys' (Upstash 'keys' is more efficient than standard Redis)
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return keys.length;
  } catch (error) {
    console.warn(`Redis pattern delete error:`, error);
    return 0;
  }
}

export async function withCache<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  const cached = await getCache<T>(key);
  if (cached !== null) return cached;
  
  const data = await fetcher();
  setCache(key, data, ttl).catch(console.error);
  return data;
}

export async function checkRedisHealth(): Promise<boolean> {
  if (!redis) return false;
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}
