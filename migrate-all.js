const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const name = process.env.config_name || 'auto';
const schemaType = process.env.schema_type;

if (!['tenant', 'root'].includes(schemaType)) {
  console.error("❌ Invalid schema_type. Use schema_type=tenant or schema_type=root");
  process.exit(1);
}

try {
  console.log(`📦 Running migration: ${name}`);
  console.log(`📂 Schema type: ${schemaType}`);

  // 1. 조합된 스키마 생성
  execSync(`node generate-schema.js --type=${schemaType}`, { stdio: 'inherit' });

  const schemaPath = `prisma/schema.${schemaType}.prisma`;

  // 2. 마이그레이션 생성 (단일 DB 기준)
  execSync(`npx prisma migrate dev --name "${name}" --schema=${schemaPath}`, {
    stdio: 'inherit',
  });

  execSync(`npx prisma generate --schema=${schemaPath}`, {
    stdio: 'inherit',
  });

  // 3. 모든 테넌트 DB에 반복 deploy
  if (schemaType === 'tenant') {
    const rootPrisma = new PrismaClient();
    await rootPrisma.$connect();

    const clients = await rootPrisma.client.findMany();
    for (const client of clients) {
      console.log(`🚀 Deploying to tenant: ${client.clientCode}`);
      execSync(`npx prisma migrate deploy --schema=${schemaPath}`, {
        env: {
          ...process.env,
          DATABASE_URL: client.dbUrl,
        },
        stdio: 'inherit',
      });
    }

    await rootPrisma.$disconnect();
    console.log(`✅ All tenant DBs migrated`);
  }

  console.log(`✅ Migration complete for schema: ${schemaType}`);
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}