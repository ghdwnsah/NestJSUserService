// migrate.js
const { execSync } = require('child_process');

const name = process.env.config_NAME || 'auto';

console.log(`📦 Running migration with name: ${name}`);
execSync(`npm run generate-schema && npx prisma migrate dev --name ${name} && npx prisma generate`, {
  stdio: 'inherit',
});