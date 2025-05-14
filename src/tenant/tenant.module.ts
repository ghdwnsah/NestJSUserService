import { Logger, Module } from '@nestjs/common';
import { TenantPrismaProvider } from './tenant.provider';
import { TenantPrismaService } from './tenant-client.manager';
import { CustomCacheModule } from '@/shared/cache/cache.module'; // 캐시 주입 필요 시
import { PrismaService } from '@/core/infra/db/prisma.service';
import { CustomCacheService } from '@/shared/cache/cache.service';

@Module({
  imports: [CustomCacheModule],
  providers: [
    TenantPrismaService,
    PrismaService,
    TenantPrismaProvider,
    Logger,
  ],
  exports: [
    'PRISMA_CLIENT',
    TenantPrismaService
  ],
})
export class TenantModule {}