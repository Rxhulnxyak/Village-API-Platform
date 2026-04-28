import app from './app';
import { prisma } from './lib/prisma';
import { redis } from './lib/redis';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`VillageAPI backend running on port ${PORT}`);
});

// SIGTERM handling: Vercel sends SIGTERM before killing a function instance.
// Graceful shutdown: stop accepting new requests, finish in-flight requests, close DB connections.
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    if (redis) {
      redis.disconnect();
    }
    process.exit(0);
  });
});
