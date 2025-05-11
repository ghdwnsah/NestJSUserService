import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { PrismaService } from '@/core/infra/db/prisma.service';

@Injectable()
export class PrismaHealthIndicator {
  constructor(private readonly prisma: PrismaService) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
      return {
        [key]: {
          status: 'up',
        },
      };
    } catch (error) {
      return {
        [key]: {
          status: 'down',
          message: 'Prisma health check failed',
        },
      };
    }
  }
}
