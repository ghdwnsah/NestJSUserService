# 1. 베이스 이미지 설정
FROM node:18-alpine

# 2. 작업 디렉토리 생성
WORKDIR /app

# 3. 패키지 설치
COPY package*.json ./
RUN npm install

# 4. 앱 소스 복사
COPY . .

# 5. Prisma build (옵션: generate + migrate 필요 시)
RUN npx prisma generate

# 6. 빌드 및 실행
RUN npm run build

# 7. 앱 실행 명령
CMD ["npm", "run", "start:prod"]