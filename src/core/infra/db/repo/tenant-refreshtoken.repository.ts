import { PrismaService } from "@/core/infra/db/prisma.service";
// import { CreateClientDbDto } from "@/users/interface/dto/create-client-db.dto";
import { CreateUserDbModel } from "@/core/domain/db/create-user-db.model";
import { Prisma, PrismaClient, RefreshToken, User } from '@prisma/client';
import { Inject, Injectable, OnModuleInit, Scope } from "@nestjs/common";
import { IUserRepositoryForEmail } from "@/email/domain/repository/iUser.repository";
import { iUserRepositoryForClientAdmins } from "@/client-admins/infra/adapter/iUser.repository";
import { IUserRepoForCore } from "../../adapter/iUser.repository";
import { IUserRepositoryForAuth } from "@/auth/infra/adaper/iUser.repository";
import { GetClientUserInfoQueryResponse } from "@/client-admins/interface/response/get-clientUserInfoQuery.response";
import { Role } from "@/core/common/roles/role.enum";
import { UserWithClient } from "@/core/interface/types/userAndClient";
import { CreateSocialUserDbModel } from "@/core/domain/db/create-socialUser-db.model";
import { REQUEST } from "@nestjs/core";
import { TenantPrismaService } from "@/tenant/tenant-client.manager";
import { UpdateClientDbDto } from "@/core/interface/dto/update-client-db.dto";
// import { IUserRepoForEmail } from "@/email/application/port/iUserRepo.service";
// import { iUserRepositoryForClientAdmins } from "@/client-admins/application/ports/iUser.repository";
// import { IUserRepositoryForCore } from "@/core/application/port/iUser.repository";

@Injectable()
export class TenantRefreshTokenRepository {

  constructor(
    private readonly tenantPrismaService: TenantPrismaService,
  ) {}

  private async getTenantClient(clientCode: string): Promise<PrismaClient> {
    return this.tenantPrismaService.getPrismaClientByCode(clientCode);
  }
  
  async createRefreshToken(clientCode: string, userId: string, token: string, expiresAt: Date, ip: string): Promise<any> {
    const tenantClient = await this.getTenantClient(clientCode); 
    return await tenantClient.refreshToken.create({
          data: {
            token,
            userId,
            expiresAt,
            ip,
          },
      })
  }

  async invalidatePreviousRefreshTokens(clientCode: string, userId: string): Promise<any> {
    const tenantClient = await this.getTenantClient(clientCode);
    return await tenantClient.refreshToken.updateMany({
            where: {
                userId,
                isValid: true,
            },
            data: {
                isValid: false,
            },
        });
    }
  



}