import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../core/infra/db/prisma.service';
import { CustomCacheService } from '@/shared/cache/cache.service';
import authConfig from '@/core/common/config/authConfig';
import { ConfigType } from '@nestjs/config';




@Injectable()
export class TenantPrismaService {
  private readonly clientMap: Map<string, PrismaClient> = new Map();
  private readonly lastUsedMap = new Map<string, number>();

  constructor(
    private readonly rootPrisma: PrismaService,
    private readonly cacheService: CustomCacheService,
    @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
    @Inject(Logger) private readonly logger: LoggerService,
  ) {
    // 주기적으로 오래된 PrismaClient 정리
    setInterval(() => this.cleanupIdleClients(), this.config.tenantClientCacheCleanupInterval);
  }

  async getPrismaClientByCode(clientCode: string): Promise<PrismaClient> {
    const now = Date.now();

    // 메모리 캐시 우선
    if (this.clientMap.has(clientCode)) {
      this.lastUsedMap.set(clientCode, now);
      return this.clientMap.get(clientCode);
    }

    // 1. Redis에서 dbUrl 조회
    console.log('Redis에서 dbUrl 조회');
    let dbUrl = await this.cacheService.getTenantClientDbUrlCache(clientCode);

    // 2. 없으면 root DB에서 조회 후 Redis 저장
    console.log('없으면 root DB에서 조회 후 Redis 저장');
    if (!dbUrl) {
      const client = await this.rootPrisma.client.findUnique({
        where: { clientCode },
      });

      if (!client || !client.dbUrl) {
        throw new Error(`Invalid clientCode or dbUrl not found for clientCode: ${clientCode}`);
      }

      dbUrl = client.dbUrl;
      await this.cacheService.setTenantClientDbUrlCache(clientCode, dbUrl);
    }

    // 동적 import로 tenant 전용 PrismaClient 로드
    console.log('동적 import로 tenant 전용 PrismaClient 로드');
    const generatedPath = `../../prisma/generated/client_${clientCode}`;
    console.log('generatedPath : ', generatedPath);
    const { PrismaClient } = await import(generatedPath);

    // 3. PrismaClient 생성 및 연결
    console.log('PrismaClient 생성 및 연결');
    const tenantClient = new PrismaClient({
      datasources: {
        db: { url: dbUrl },
      },
    });

    await tenantClient.$connect();

    // 4. LRU 방식으로 사이즈 초과 시 제거
    if (this.clientMap.size >= this.config.tenantClientCacheMaxSize) {
      this.evictLeastRecentlyUsedClient();
    }

    // 5. 메모리 캐시에 저장
    this.clientMap.set(clientCode, tenantClient);
    this.lastUsedMap.set(clientCode, now);

    return tenantClient;
  }


  private evictLeastRecentlyUsedClient() {
    let oldestKey: string = null;
    let oldestTime = Infinity;

    for (const [key, lastUsed] of this.lastUsedMap.entries()) {
      if (lastUsed < oldestTime) {
        oldestKey = key;
        oldestTime = lastUsed;
      }
    }

    if (oldestKey) {
      const client = this.clientMap.get(oldestKey);
      client?.$disconnect();
      this.clientMap.delete(oldestKey);
      this.lastUsedMap.delete(oldestKey);

      this.logger.log(`🧹 LRU: Disconnected and removed PrismaClient for '${oldestKey}'`);
    }
  }

  private cleanupIdleClients() {
    const now = Date.now();
    for (const [key, lastUsed] of this.lastUsedMap.entries()) {
      if (now - lastUsed > this.config.tenantClientCacheIdleTimeout) {
        const client = this.clientMap.get(key);
        client?.$disconnect();
        this.clientMap.delete(key);
        this.lastUsedMap.delete(key);

        this.logger.log(`⏲️ TTL: Auto-disconnected idle PrismaClient for '${key}'`);
        this.logCacheStatus();
      }
    }
  }

  private logCacheStatus() {
    const keys = Array.from(this.lastUsedMap.entries())
      .sort((a, b) => a[1] - b[1]) // 오래된 순
      .map(([key, lastUsed]) => {
        const minsAgo = Math.floor((Date.now() - lastUsed) / 1000 / 60);
        return `• ${key} (${minsAgo}분 전 사용됨)`;
      });
  
    this.logger.log(`🧠 PrismaClient 캐시 상태 (${this.clientMap.size}개):\n${keys.join('\n')}`);
  }
}