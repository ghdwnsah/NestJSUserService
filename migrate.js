const { execSync } = require('child_process');

const name = process.env.config_name || 'auto';
const schemaType = process.env.schema_type || 'tenant'; // default: tenant
const dbUrl = process.env.DATABASE_BASE_URL;


console.log(`🔗 migrate.js config_name: ${name}`);
console.log(`🔗 migrate.js schema_type: ${schemaType}`);
console.log(`🔗 migrate.js DATABASE_BASE_URL: ${dbUrl}`);

if (!['tenant', 'root'].includes(schemaType)) {
  console.error("❌ Invalid schema_type. Use schema_type=tenant or schema_type=root");
  process.exit(1);
}

if (schemaType === 'tenant') {
  if (!dbUrl) {
    console.error("❌ DATABASE_URL is required as an environment variable.");
    process.exit(1);
  }
}

console.log(`📦 Running migration: ${name}`);
console.log(`📂 Schema type: ${schemaType}`);
console.log(`🔗 Target DB: ${dbUrl}`);

console.log(`🔄 migrate.js Generating Prisma schema...`);

// 작업 영역
if (schemaType === 'tenant') {
  console.log(`🔄 migrate.js Generating tenant schema...`);
    try {
    // 1. 스키마 파일 합치기
    execSync(`node generate-schema.js --type=${schemaType}`, { stdio: 'inherit' });

    // 2. 새 마이그레이션 생성 - 후에 테스트
    // console.log(`🛠 Creating new migration: ${name}`);
    // execSync(`npx prisma migrate dev --name=${name} --schema=prisma/schema.${schemaType}.prisma --create-only`, {
    //   stdio: 'inherit',
    //   env: {
    //     ...process.env,
    //     DATABASE_URL: dbUrl,
    //   },
    // });

    // 2. DB에 마이그레이션 적용
    execSync(`npx prisma migrate deploy --schema=prisma/schema.${schemaType}.prisma`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: dbUrl,
      },
    });

    // 3. Prisma Client 생성 (테넌트별 디렉토리)
    // const outputDir = `./prisma/generated/client_${name}`;
  execSync(`npx prisma generate --schema=prisma/schema.${schemaType}.prisma`, {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl },
  });

    console.log(`✅ Migration completed for schema '${schemaType}' with name '${name}'`);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}
else if (schemaType === 'root') {
  console.log(`🔄 migrate.js Generating root schema...`);
  execSync(`npm run generate-schema && npx prisma migrate dev --name ${name} && npx prisma generate`, {
    stdio: 'inherit',
  });

} else {
  console.error("❌ Invalid schema_type. Use schema_type=tenant or schema_type=root");
  process.exit(1);
}
