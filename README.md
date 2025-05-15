# NestJS 기반 유저 서비스 포트폴리오

## 🧩 프로젝트 개요
NestJS 기반 유저 서비스는 SaaS(Software as a Service) 형태를 지원하는 백엔드 애플리케이션으로, 다양한 고객(테넌트)에게 독립된 데이터베이스 환경을 제공하는 멀티 테넌시 아키텍처를 핵심으로 설계되었습니다.

본 프로젝트는 단순한 유저 CRUD를 넘어, 다음과 같은 고급 아키텍처 설계 및 보안 구조를 직접 구현하는 데에 중점을 두었습니다:

---

## 🔧 기술 스택

| 분류 | 사용 기술 | 활용 및 목적 |
| --- | --- | --- |
| Language | TypeScript | NestJS 전반에서 정적 타입 안정성 확보 |
| Framework | NestJS (v10) | 모듈화, DI, Guards, Pipes, Interceptors 적용 |
| ORM | Prisma ORM | 테넌트별 동적 PrismaClient 관리 및 스키마 기반 DB 추상화 |
| Database | MySQL | 각 테넌트별 물리 DB 분리(Database-per-Tenant 패턴) |
| 인증/보안 | JWT, Passport, Google OAuth2, 2FA, IP 차단 | JWT 인증, Google 로그인, TOTP 기반 2단계 인증, 보안 필터링 강화 |
| 권한 제어 | RBAC + PBAC (with Guard/Decorator) | `@Roles()`, `@Permissions()` 기반 접근 제어. 향후 CASL 전환 예정 |
| Cache | Redis + In-memory Cache | 2단계 캐싱 전략으로 응답 속도 최적화 및 자원 절약 |
| 아키텍처 | CQRS, DDD, Clean Architecture | 명령/조회 분리, 도메인 중심 계층화, 책임 단일화 실현 |
| 문서화 | Swagger (`@nestjs/swagger`) | API 문서 자동화 적용 중 |
| 테스트 | Jest, `@nestjs/testing` | 유닛/통합 테스트 환경 구성 및 DI 기반 테스트 가능 |
| DevOps | Docker, Docker Compose | 로컬/운영 환경 격리 및 컨테이너 기반 실행 환경 구현 |

---

## 🧠 시스템 아키텍처 개요

### 핵심 구성 흐름

```
[ Client ]
     |
     v
[ Controller (REST) ]
     |
     v
[ CQRS: Command / Query Handler ]
     |
     v
[ Domain Service ]
     |
     v
[ PrismaClientManager ] ← Uses → [ Redis / Memory Cache ]
     |
     v
[ Multi-Tenant DBs (per tenant) ]
```

### 시스템 특성 요약

- **CQRS 기반**: 명령/조회 책임 분리로 복잡도 제어 및 성능 분산
- **PrismaClientManager**: 테넌트 ID 기반 Prisma 인스턴스 동적 생성 및 캐싱
- **2단계 캐시 전략**: 메모리 → Redis 순으로 조회 최적화
- **Guard/Decorator 중심 권한 제어**: RBAC + PBAC 혼합 패턴 적용
- **소셜 로그인/2FA/IP 차단 등 보안 강화 요소 포함**

---

## 🏆 주요 성과 요약

| 항목 | 내용 |
| --- | --- |
| SaaS 구조 설계 | 테넌트 생성 시 별도 DB 생성, 데이터 완전 격리, Prisma 기반 유연한 연결 구조 구현 |
| 인증 보안 기능 | JWT, 소셜 로그인(Google), 2FA(TOTP), 디바이스 인증, IP 차단 구현 완료 |
| 권한 구조 | `@Roles()` + `@Permissions()` 기반 접근 제어, 향후 CASL 도입으로 ABAC 확장 계획 포함 |
| 캐시 최적화 | In-memory + Redis 조합으로 API 응답 속도 개선 및 부하 분산 실현 |
| 설계 철학 | DDD와 클린 아키텍처 기반 계층 설계로 유지보수성과 테스트 용이성 확보 |
| 개발 운영 전환 | Docker 기반 통합 실행 환경 구성으로 로컬/운영 환경 통일 |

---

## 🧱 구조적 설계 특징

### ✅ CQRS 적용

- 명령(Command)과 조회(Query)를 완전 분리
- 복잡한 도메인 로직 분산 가능

### ✅ 멀티 테넌시 SaaS 구조

- 테넌트마다 고유 DB 할당 (Database-per-tenant)
- PrismaClientManager로 연결 관리 및 캐싱

### ✅ 클린 아키텍처

- Application / Domain / Infrastructure 계층 분리
- Repository 인터페이스 → 의존성 역전(DIP)
- 테스트 및 유지보수 용이

### ✅ 인증(Authentication)

- **JWT 기반 인증**: Access / Refresh Token 분리, Refresh Token Rotation 구현
- **소셜 로그인**: Google OAuth2 인증 구현 (`google.strategy.ts`)
- **2FA (Two-Factor Authentication)**:
    - TOTP 기반 Google Authenticator 연동
    - QR 코드 생성 및 OTP 검증 흐름 구축 (`verify_generateTwoFactorQr.handler.ts`, `verify_twoFactorOtp.handler.ts`)
- **디바이스 인증 및 세션 관리**:
    - 기기 고유 토큰 발급 및 저장
    - `TrustedDevice` 테이블로 신뢰 기기 목록 관리
- **IP 차단 정책**:
    - `ipDenyList` 테이블에 등록된 IP 요청 자동 차단
    - 미들웨어 기반 차단 적용 가능
- **토큰 재발급 흐름**:
    - `update-refreshAccessToken.handler.ts`를 통한 Refresh → Access 재발급

### ✅ 인가(Authorization)

- **RBAC (Role-Based Access Control)**:
    - `@Roles()` 커스텀 데코레이터 기반 역할 주입
    - `roles.guard.ts`를 통한 역할 기반 API 접근 제어
    - 지원 역할: `USER`, `ADMIN`, `SUPER_ADMIN`, `TENANT_ADMIN` 등
- **PBAC (Permission-Based Access Control) 일부 포함**:
    - `permissions.decorator.ts`, `permission.guard.ts` 등에서 세분화된 퍼미션 적용 구조 확인
    - `permission.map.ts`를 기반으로 각 API 별 권한 분기 가능
- **NestJS Guards 설계**
    - `JwtAuthGuard`: 기본 토큰 검증
    - `RolesGuard`: RBAC 제어
    - `PermissionGuard`: 특정 리소스 접근 권한 확인
    - `PaidClientCheckGuard`: 유료 고객 여부 기반 필터링 (도메인 로직 분리)
- **Custom Decorator**
    - `@User()`, `@Roles()`, `@Permissions()` 등 다수 커스텀 데코레이터 정의 및 활용
    - 요청 컨텍스트 기반 사용자 주입 및 역할/퍼미션 확인 로직 분리

### 보안 강화 요소

- **ValidationPipe**: 모든 DTO 유효성 검사 강화 (`class-validator`)
- **Helmet, CORS 설정**: 미들웨어에서 보안 헤더 및 출처 제한 설정
- **Rate Limiting (향후 고려)**: 로그인 시도 제한 및 brute-force 공격 방어
- **RBAC → CASL 전환 계획**

## 🧠 포인트 요약

> 본 프로젝트에서는 NestJS의 인증/인가 시스템을 커스터마이징하고, RBAC와 PBAC를 혼합한 실무 수준의 권한 제어 구조를 구현했습니다.
> 
> 
> 특히 2FA, 소셜 로그인, 디바이스 토큰, IP 블락 등 **보안성과 사용자 경험을 모두 고려한 고급 인증 흐름**을 갖추고 있습니다.
> 

---

## 📈 개선 예정 및 고도화 계획

- [ ]  ⏸️ **CI/CD 자동화** *(보류 중)*
    - GitHub Actions 기반 빌드/테스트/배포 파이프라인 구축 예정
- [ ]  🟡 **테스트 커버리지 확대**
    - 통합 테스트 및 Guard/Handler 단위 테스트 보강
    - `@nestjs/testing` 기반 Mock 환경 구성
- [ ]  🟡 **Swagger API 문서 완성**
    - `@nestjs/swagger` 기반 문서화 자동화 예정
- [ ]  🚧 **Kafka 기반 이벤트 처리 구조 설계 중**
    - 인증/가입/로그인 이벤트 → 알림/로그 전송 비동기 처리 계획
- [ ]  ⏸️ **K8s 배포 대응**
    - Helm Chart 기반 환경 분리 및 ConfigMap 활용 계획
- [ ]  🧩 **RBAC → CASL 전환 계획**
    - 현재는 `RolesGuard`, `PermissionGuard` 조합으로 권한 제어
    - 향후 `CASL` 기반 리소스 단위 권한 정책(Ability-based ACL)으로 확장 예정
    - 예: `can("manage", "User")`와 같은 논리적 표현 활용 가능

---

## 🧪 실행 및 테스트

```bash
# 환경 설정
cp .env.example .env

# 패키지 설치
npm install

# DB 마이그레이션
npx prisma migrate deploy

# 개발 서버 실행
npm run start:dev

# 테스트
npm run test
```

---

## 🙋🏻‍♂️ 기여도 및 참고

- 본 프로젝트는 개인 프로젝트로 모든 코드 및 구조 직접 설계 및 구현
- NestJS, Prisma 공식 문서 및 한용재 저자의 NestJS로 배우는 백엔드 프로그래밍, 일부 GitHub 오픈소스 구조 참고

---

## 🔗 관련 링크

- GitHub: https://github.com/ghdwnsah/NestJSUserService
- Swagger: `/api-docs` (작성 중)
- 문의: ghdwwns@gmail.com