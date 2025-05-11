import { Injectable, PipeTransform, ForbiddenException, Inject } from '@nestjs/common';
import { PrismaService } from '@/core/infra/db/prisma.service';
import { UserInfo } from '@/core/interface/userInfo'; // req.user 타입 추론용
import { User } from '@prisma/client';
import { IClientRepoForCore } from '../adapter/iClient.repository';

@Injectable()
export class PaidClientCheckPipe implements PipeTransform<UserInfo, Promise<UserInfo>> {
  constructor(
    @Inject('ClientRepository') private readonly clientRepo: IClientRepoForCore,
) {}

  async transform(user: User): Promise<UserInfo> {
    console.log('pipe 호출')
    if (!user.clientId) {
      throw new ForbiddenException('No client associated with this user');
    }

    const isPaid = await this.clientRepo.isClientPaid(user.clientId);
    if (!isPaid) {
      throw new ForbiddenException('Client is not paid');
    }
    console.log('pipe 호출2')
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        clientId: user.clientId,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
    }; // 결제 완료된 유저만 통과
  }
}