const fs = require('fs');
const path = require('path');

// 환경에서 클라이언트 코드와 기본 DB URL을 읽음
const clientCode = process.env.config_name || 'auto';
const baseDbUrl = process.env.DATABASE_URL || 'mysql://root:test@localhost:3306';

// 클라이언트 DB 이름 생성 (예: client_cl_abc123)
const dbName = `client_${clientCode.toLowerCase().replace(/^clientcreate_/, '')}`;
const fullDbUrl = `${baseDbUrl.replace(/(\/)[^\/]*$/, '')}/${dbName}`;

// ENV 키 이름 생성 (예: DATABASE_URL_CLIENTCREATE_CL_ABC123)
const envKey = `DATABASE_URL_${clientCode.toUpperCase().replace(/-/g, '_')}`;
const envLine = `${envKey}=${fullDbUrl}`;

const envPath = path.resolve(__dirname, '.env');
let content = '';

// .env 파일 읽기 (없으면 새로 만들 준비)
try {
  content = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
  console.log('🔔 .env 파일이 없어서 새로 생성합니다.');
}

// 이미 키가 존재하면 추가하지 않음
if (content.includes(`${envKey}=`)) {
  console.log(`✅ ${envKey} 이미 .env에 존재합니다.`);
} else {
  fs.appendFileSync(envPath, `\n${envLine}`);
  console.log(`✅ ${envKey} 추가됨: ${fullDbUrl}`);
}