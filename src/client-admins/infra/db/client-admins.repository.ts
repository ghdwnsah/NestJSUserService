// import { IClientAdminsRepoForClientAdmins } from "@/client-admins/application/ports/iClientAdmins.repository";
// import { iUserRepositoryForClientAdmins } from "@/client-admins/application/ports/iUser.repository";
import { CreateClientDbDto } from "@/client-admins/interface/dto/create-client-db.dto";
import { CreateClientAdminUserResponse } from "@/client-admins/interface/reponse/createClientAdminUser.response";
// import { IClientRepoForClientUsers } from "@/client-users/application/port/iClientRepoForClientUsers.service";
import { PrismaService } from "@/core/infra/db/prisma.service";
import { CreateUserDbDto } from "@/core/interface/dto/create-user-db.dto";
import { Inject, Injectable } from "@nestjs/common";
import { Client, User } from "@prisma/client";
import { iUserRepositoryForClientAdmins } from "../adapter/iUser.repository";

@Injectable()
export class ClientAdminsRepository {
    constructor(
        private readonly prismaService: PrismaService,

        @Inject('UserRepository') private readonly userRepository: iUserRepositoryForClientAdmins,
    ) {}

    async createClientAdminUser(createUserDbDto: CreateUserDbDto, clientDbDto: CreateClientDbDto): Promise<CreateClientAdminUserResponse> {
        return await this.prismaService.$transaction(async (tx) => {
          // 1. 클라이언트 생성
          const client = await tx.client.create({ data: clientDbDto });
    
          // 2. 클라이언트 Admin 유저 생성
          const user = await this.userRepository.createUserWithTransaction(tx, {
            ...createUserDbDto,
              clientId: client.id
          })
    
          return {
            clientCode: client.clientCode
          };
        });
      }

    async getUsersByRole(role: string) {
        return await this.prismaService.user.findMany({
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
        return await this.prismaService.user.findMany({
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
        return await this.prismaService.client.findUnique({
          where: { clientCode },
        });
    }

    async isClientPaid(id: string): Promise<boolean> {
        const client = await this.prismaService.client.findUnique({
          where: { id },
          select: { isPaid: true },
        });
        return client?.isPaid || false;
    }

    async findAllUsers(offset: number, limit: number): Promise<User[]> {
        return await this.prismaService.user.findMany({
            skip: offset,
            take: limit,
        });
    }

    async updateUser(id: string, updateData: any) {
      return await this.prismaService.user.update({
          where: { id },
          data: updateData,
      });
    }

    async updateUserPassword(id: string, hashedPassword: string): Promise<User> {
      return await this.prismaService.user.update({
          where: { id },
          data: { password: hashedPassword }
      });
  }
}