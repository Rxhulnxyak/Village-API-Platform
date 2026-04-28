/**
 * Database Seed Script
 * Run: npx prisma db seed
 *
 * WHY UPSERT not CREATE: Seed must be idempotent — safe to run multiple times
 * without creating duplicate records. Upsert = insert or update if exists.
 * This allows re-seeding after schema changes without manual cleanup.
 */

import { PrismaClient, PlanType, UserStatus } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Upsert Country: India
  const india = await prisma.country.upsert({
    where: { code: 'IN' },
    update: { name: 'India', callingCode: '+91' },
    create: { code: 'IN', name: 'India', callingCode: '+91' },
  });
  console.log(`Upserted Country: ${india.name}`);

  // 2. Upsert admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@villageapi.com';
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || await bcryptjs.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { 
      status: UserStatus.ACTIVE,
      planType: PlanType.UNLIMITED
    },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      businessName: 'VillageAPI Admin',
      status: UserStatus.ACTIVE,
      planType: PlanType.UNLIMITED
    },
  });
  console.log(`Upserted Admin User: ${adminUser.email}`);

  // 3. Upsert demo ApiKey
  const demoKeyStr = 'ak_demo' + '0'.repeat(28);
  const demoSecretHash = await bcryptjs.hash('demo_secret', 10);
  
  const demoKey = await prisma.apiKey.upsert({
    where: { key: demoKeyStr },
    update: { name: 'Demo Key', isActive: true },
    create: {
      key: demoKeyStr,
      secretHash: demoSecretHash,
      name: 'Demo Key',
      userId: adminUser.id,
      isActive: true,
    },
  });
  console.log(`Upserted Demo API Key: ${demoKey.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // IMPORTANT in seed scripts — process hangs otherwise
    await prisma.$disconnect();
  });
