import { PrismaService } from "@/core/infra/db/prisma.service";
// import { CreateClientDbDto } from "@/users/interface/dto/create-client-db.dto";
import { CreateUserDbModel } from "@/core/domain/db/create-user-db.model";
import { Prisma, PrismaClient, User } from '@prisma/client';
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
export class TenantUserRepository {

  constructor(
    private readonly tenantPrismaService: TenantPrismaService,
    // @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient
    // @Inject(REQUEST) private readonly request: Request,
    // private readonly tenantPrismaService: TenantPrismaService,
  ) {}

  private async getTenantClient(clientCode: string): Promise<PrismaClient> {
    return this.tenantPrismaService.getPrismaClientByCode(clientCode);
  }

  async createUser(clientCode: string, userDto: CreateUserDbModel): Promise<User> {
    const tenantClient = await this.getTenantClient(clientCode);
    return tenantClient.user.create({ data: userDto });
  }

  async createLegacyCompatibilityClientMeta(clientCode: string, clientId: string, dto: UpdateClientDbDto) {
    const tenantClient = await this.getTenantClient(clientCode);
    return tenantClient.client.create({
      data: {
        id: clientId,
        clientCode,
        ...dto,
      },
    });
  }

  async findUserBySignupVerifyToken(clientCode: string, signupVerifyToken: string): Promise<User> {
    const tenantClient = await this.getTenantClient(clientCode);
    return await tenantClient.user.findFirst({ where: {signupVerifyToken} });
  }

  async updateUserVerifiedTrue(clientCode: string, email: string): Promise<User> {
    const tenantClient = await this.getTenantClient(clientCode);
    return await tenantClient.user.update({ where: { email }, data: { verified: true } });
  }


  // async createUser(userDbDto: CreateUserDbModel): Promise<User> {
  //   return await this.prisma.user.create({ data: userDbDto });
  // }

  // async createSocialUser(socialUserDbDto: CreateSocialUserDbModel): Promise<User> {
  //   console.log('들어옴 4 : ');
  //   return await this.prisma.user.create({ data: socialUserDbDto });
  // }

  // async createUserWithTransaction(tx: Prisma.TransactionClient, userDto: CreateUserDbModel): Promise<User> {
  //   return await tx.user.create({
  //     data: userDto,
  //   });
  // }

  // async registerTrustedDevice(device) {
  //   await this.prisma.trustedDevice.create({
  //     data: device,
  //   });
  // }  

  // async setTwoFactorSecret(id: string, twoFactorSecret: string): Promise<User> {
  //   return this.prisma.user.update({ 
  //     where: { id },
  //     data: { twoFactorSecret },
  //   });
  // }

  // async setIsTwoFactorAuth(id: string, value: boolean): Promise<User> {
  //   return this.prisma.user.update({ 
  //     where: { id },
  //     data: { isTwoFactorEnabled: value },
  //   });
  // }

  // async getUserById(id: string): Promise<User> {
  //   return await this.prisma.user.findUnique(
  //     { 
  //       where: { id },
  //       include: {
  //         client: true,
  //       }, 
  //   });
  // }
  // async getUserByIdForClientAdmin(id: string): Promise<GetClientUserInfoQueryResponse | void> {
  //   const user = await this.prisma.user.findUnique(
  //     { 
  //       where: { id },
  //       include: {
  //         client: true,
  //       },
  //     });
  //   if (!user) return;
  //   else return {
  //     id: user.id,
  //     name: user.name,
  //     email: user.email,
  //     verified: user.verified,
  //     createdAt: user.createdAt,
  //     role: user.role as Role,
  //     client: {
  //       name: user.client.name,
  //       clientCode: user.client.clientCode
  //     }
  //   };
  // }

  // async getUserByEmail(email: string): Promise<User> {
  //   return await this.prisma.user.findUnique(
  //     { 
  //       where: { email },
  //       include: {
  //         client: true,
  //       },
  //     });
  // }
  // async getUserByEmailForClientAdmin(email: string): Promise<GetClientUserInfoQueryResponse> {
  //   const user = await this.prisma.user.findUnique(
  //     { 
  //       where: { email },
  //       include: {
  //         client: true,
  //       },
  //     });
  //   return {
  //     id: user.id,
  //     name: user.name,
  //     email: user.email,
  //     verified: user.verified,
  //     createdAt: user.createdAt,
  //     role: user.role as Role,
  //     client: {
  //       name: user.client.name,
  //       clientCode: user.client.clientCode
  //     }
  //   };
  // }

  // async updateUser(id: string, data: any): Promise<User> {
  //   return await this.prisma.user.update({ where: { id }, data });
  // }

  // async updateUserVerifiedTrue(email: string): Promise<User> {
  //   return await this.prisma.user.update({ where: { email }, data: { verified: true } });
  // }

  // async deleteUser(id: string): Promise<User>  {
  //   return await this.prisma.user.delete({
  //       where: { id },
  //   });
  // }

  // async getAllUsers(clientId: string) {
  //   return await this.prisma.user.findMany({ where: { clientId } });
  // }

  // async findUserById(id: string): Promise<User> {
  //   return await this.prisma.user.findFirst({ where: { id }, 
  //   include: {
  //     client: true,
  //   }, });
  // }

  // async findOneForClientAdmin(id: string, clientId: string): Promise<User> {
  //   return await this.prisma.user.findFirst({ where: { id, clientId } });
  // }

  // async findUserByEmail(email: string): Promise<UserWithClient> {
  //   return await this.prisma.user.findFirst({ 
  //     where: {email}, 
  //     include: {
  //       client: true,
  //   }, });
  // }

  // async findUserBySignupVerifyToken(signupVerifyToken: string): Promise<User> {
  //   return await this.prisma.user.findFirst({ where: {signupVerifyToken} });
  // }

  // async findResetPasswordValidToken(token: string): Promise<User> {
  //   return await this.prisma.user.findFirst({
  //     where: {
  //       resetPasswordToken: token,
  //       resetPasswordExpires: {
  //         gte: new Date(),
  //       },
  //     },
  //   });
  // }

  // async updatePassword(id: string, password: string): Promise<User> {
  //   return await this.prisma.user.update({
  //     where: { id },
  //     data: {
  //       password,
  //       resetPasswordToken: null,
  //       resetPasswordExpires: null,
  //     },
  //   });
  // }
}