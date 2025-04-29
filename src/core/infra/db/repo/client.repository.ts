import { PrismaService } from "@/core/infra/db/prisma.service";

import { CreateUserDbDto } from "@/core/interface/dto/create-user-db.dto";
import { UserRepository } from "./user.repository.impl";

import { Inject, Injectable } from "@nestjs/common";
import { Client, } from "@prisma/client";
import { IUserRepoForCore } from "../../adapter/iUser.repository";
// import { IClientRepoForClientUsers } from "@/client-users/application/port/iClientRepoForClientUsers.service";
// import { IUserRepositoryForCore } from "@/core/application/port/iUser.repository";

@Injectable()
export class ClientRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('UserRepository') private readonly userRepository: IUserRepoForCore,
  ) {}

  async createClientUser(createUserDbDto: CreateUserDbDto): Promise<void> {
    await this.userRepository.createUser(createUserDbDto)
    return;
  }

  async getClientById(id: string) {
    return await this.prisma.client.findUnique({ where: { id } });
  }

  async updateClient(id: string, data: any) {
    return await this.prisma.client.update({ where: { id }, data });
  }

  async deleteClient(id: string) {
    return await this.prisma.client.delete({ where: { id } });
  }

  async getAllClients() {
    return await this.prisma.client.findMany();
  }

  async findById(clientId: string) {
    return await this.prisma.client.findUnique({
      where: { id: clientId },
      include: { users: true },
    });
  }

  

  // 클라이언트 코드로 조회
  async findByClientCode(clientCode: string): Promise<Client | null> {
    return await this.prisma.client.findUnique({
      where: { clientCode },
    });
  }

  async isClientCodePaid(clientCode: string): Promise<boolean> {
    const client = await this.prisma.client.findUnique({
      where: { clientCode },
      select: { isPaid: true },
    });
    return client?.isPaid || false;
  }

  async isClientPaid(id: string): Promise<boolean> {
    const client = await this.prisma.client.findUnique({
      where: { id },
      select: { isPaid: true },
    });
    return client?.isPaid || false;
  }

  async isClientPaidByUserInfo(userId: string): Promise<boolean> {
    console.log('userId : ', userId);
    const user = await this.userRepository.findUserById(userId);// TODO : 여기 나중에 타입 명확히 하기
    console.log('user : ', user);
    return user?.client.isPaid || false;
  }

  // // 클라이언트에 관리자 추가
  // async addAdminToClient(clientId: string, userId: string): Promise<void> {
  //   await this.prisma.client.update({
  //     where: { id: clientId },
  //     data: {
  //       admins: {
  //         connect: { id: userId },
  //       },
  //     },
  //   });
  // }

  // 클라이언트에 유저 추가
  async addUserToClient(clientId: string, userId: string): Promise<void> {
    await this.prisma.client.update({
      where: { id: clientId },
      data: {
        users: {
          connect: { id: userId },
        },
      },
    });
  }
}