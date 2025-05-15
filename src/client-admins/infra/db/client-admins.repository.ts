// import { IClientAdminsRepoForClientAdmins } from "@/client-admins/application/ports/iClientAdmins.repository";
// import { iUserRepositoryForClientAdmins } from "@/client-admins/application/ports/iUser.repository";
import { UpdateClientDbDto } from "@/core/interface/dto/update-client-db.dto";
import { CreateClientAdminUserResponse } from "@/client-admins/interface/response/createClientAdminUser.response";
// import { IClientRepoForClientUsers } from "@/client-users/application/port/iClientRepoForClientUsers.service";
import { PrismaService } from "@/core/infra/db/prisma.service";
import { CreateUserDbModel } from "@/core/domain/db/create-user-db.model";
import { Inject, Injectable } from "@nestjs/common";
import { Client, PrismaClient, User } from "@prisma/client";
import { iUserRepositoryForClientAdmins } from "../adapter/iUser.repository";
import { TenantUserRepository } from "@/core/infra/db/repo/tenant-user.repository";
import { TenantPrismaService } from "@/tenant/tenant-client.manager";

@Injectable()
export class ClientAdminsRepository {
    constructor(
        private readonly rootPrisma: PrismaService,
        private readonly tenantUserRepository: TenantUserRepository,
        private readonly tenantPrismaService: TenantPrismaService,

        @Inject('UserRepository') private readonly userRepository: iUserRepositoryForClientAdmins,
    ) {}

    // async createClientAdminUser(updateClientDbDto: UpdateClientDbDto, createUserDbDto: CreateUserDbModel, tenantClient: PrismaClient): Promise<CreateClientAdminUserResponse> {
    //   // 1. 클라이언트 생성 (루트 DB)
    //   const client = await this.rootPrisma.client.update({
    //     where: { id: updateClientDbDto.id },
    //     data: {
    //       ...updateClientDbDto,
    //       isDbCreated: true,
    //     },
    //   });

    //   // 3. 테넌트 DB에 사용자 생성
    //   const user = await this.tenantUserRepository.createUserWithCustomClient({
    //       ...createUserDbDto,
    //     },
    //     tenantClient
    //   );

    //   return {
    //     id: user.id,
    //     clientCode: client.clientCode,
    //   };
    // }

    async createClient(updateClientDbDto: UpdateClientDbDto): Promise<Client> {
        return await this.rootPrisma.client.update({ 
          where: { id: updateClientDbDto.id },
          data: updateClientDbDto, 
      });
    }

    async getUsersByRole(role: string) {
        return await this.rootPrisma.user.findMany({
        where: {
            role: role.toUpperCase() as any, // 문자열을 Enum으로 변환
        },
        select: {
            name: true,
            email: true,        
            verified: true,
            createdAt: true,
            role: true,
        },
        });
    }

    async getUsersByClientIdAndRole(clientId: string, role: string) {
        return await this.rootPrisma.user.findMany({
          where: {
            clientId: clientId,
            role: role.toUpperCase() as any, // 문자열을 Enum으로 변환
          },
          select: {
            name: true,
            email: true,
            verified: true,
            role: true,
          },
        });
      }

    async findByClientCode(clientCode: string): Promise<Client | null> {
        return await this.rootPrisma.client.findUnique({
          where: { clientCode },
        });
    }

    async isClientPaid(id: string): Promise<boolean> {
        const client = await this.rootPrisma.client.findUnique({
          where: { id },
          select: { isPaid: true },
        });
        return client?.isPaid || false;
    }

    async findAllUsers(offset: number, limit: number): Promise<User[]> {
        return await this.rootPrisma.user.findMany({
            skip: offset,
            take: limit,
        });
    }

    async updateUser(id: string, updateData: any) {
      return await this.rootPrisma.user.update({
          where: { id },
          data: updateData,
      });
    }

    async updateUserPassword(id: string, hashedPassword: string): Promise<User> {
      return await this.rootPrisma.user.update({
          where: { id },
          data: { password: hashedPassword }
      });
  }
}