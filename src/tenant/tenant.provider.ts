import { Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { TenantPrismaService } from './tenant-client.manager';
import { Request } from 'express';
// import { getPrismaClientByCode } from '@/tenant/tenant-client.manager';

export const TenantPrismaProvider = {
  provide: 'PRISMA_CLIENT',
  scope: Scope.REQUEST,
  inject: [REQUEST, TenantPrismaService],
  useFactory: async (request: Request, tenantPrismaService: TenantPrismaService) => {
    const tenantId = request['tenantId'];
    if (!tenantId) {
      throw new Error('❌ tenantId가 request에 없습니다.');
    }
    return tenantPrismaService.getPrismaClientByCode(tenantId);
  },
};