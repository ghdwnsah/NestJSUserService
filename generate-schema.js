
const fs = require('fs');
const path = require('path');
const glob = require('glob');
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); // ✅ .env 직접 로딩

const args = process.argv.slice(2);
const typeArg = args.find(arg => arg.startsWith('--type='));
const type = typeArg ? typeArg.split('=')[1] : null;

if (!['tenant', 'root'].includes(type)) {
  console.error('❌ Invalid or missing --type= argument.');
  console.error('👉 Use: --type=tenant OR --type=root');
  process.exit(1);
}

const fileMap = {
  root: [
    'baseSchema.prisma',
    'clientSchema.prisma',
  ],
  tenant: [
    'baseSchema.prisma',
    'clientSchema.prisma',
    'userSchema.prisma',
    'refreshtokenSchema.prisma',
    'trustedDevices.prisma',
    'ipDenylist.prisma',
  ],
};

console.log(`🔍 Searching for Prisma schema files for type: ${type}...`);

const searchDir = path.resolve(__dirname, 'src');
const allPrismaFiles = glob.sync(`${searchDir}/**/*.prisma`);

const requiredFiles = fileMap[type];
const collectedSchemas = [];

for (const fileName of requiredFiles) {
  const fullPath = allPrismaFiles.find(p => p.endsWith(fileName));
  if (!fullPath) {
    console.error(`❌ Could not find required schema file: ${fileName}`);
    process.exit(1);
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  collectedSchemas.push(`// 🔹 ${fileName}\n${content}`);
}

console.log(`📦 Found ${requiredFiles.length} required schema files.`);

const outputPath = path.resolve(__dirname, `prisma/schema.${type}.prisma`);
let finalSchema = collectedSchemas.join('\n\n');

// 🔍 baseDbUrl에서 이미 DB명이 붙어 있다면 제거
const baseDbUrl = (process.env.DATABASE_URL || 'mysql://root:test@localhost:3306').replace(/\/[^\/]*$/, '');

const clientCode = process.env.config_name || 'auto';
const trimmedCode = clientCode.toLowerCase().replace(/^clientcreate_/, '');
const dbName = `client_${trimmedCode}`;

// ✅ envKey, fallback URL 계산
const envKey = `DATABASE_URL_${clientCode.toUpperCase().replace(/-/g, '_')}`;
// const fallbackDbUrl = `${baseDbUrl.replace(/(\/)[^\/]*$/, '')}/${dbName}`;
const fallbackDbUrl = `${baseDbUrl}/${dbName}`;
let dbBlock = '';

if (process.env[envKey]) {
  dbBlock = `url      = env("${envKey}")`;
} else {
  dbBlock = `url      = "${fallbackDbUrl}"`;
}

// ✅ 기존 generator client 제거 (중복 방지)
finalSchema = finalSchema.replace(/generator client\s*{[^}]*}/gm, '');

// ✅ datasource 블록 치환
finalSchema = finalSchema.replace(/datasource db {[^}]*}/gm, `
datasource db {
  provider = "mysql"
  ${dbBlock}
}
`);

// ✅ 새로운 generator 삽입
const outputDir = `./generated/client_${trimmedCode}`;
const generatorBlock = `
generator client {
  provider = "prisma-client-js"
  output   = "${outputDir}"
}
`;

fs.writeFileSync(outputPath, finalSchema + '\n\n' + generatorBlock);
console.log(`✅ Successfully generated \${outputPath} from \${requiredFiles.length} files.`);
