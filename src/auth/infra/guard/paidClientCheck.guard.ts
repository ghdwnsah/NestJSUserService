import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IClientRepoForAuth } from '../adaper/iClient.repository';
import { AuthenticatedRequest } from '@/auth/interface/types/authenticated-request';

// TODO : 슈퍼 어드민 용 통과 만들기
@Injectable()
export class PaidClientGuard implements CanActivate {
  constructor(
    @Inject('ClientRepository') private readonly clientRepo: IClientRepoForAuth,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const isPaid = await this.clientRepo.isClientPaidByUserInfo(user.id);
    if (!isPaid) {
      throw new ForbiddenException('Client subscription required');
    }

    return true; // 통과
  }
}