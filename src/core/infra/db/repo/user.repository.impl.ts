import { PrismaService } from "@/core/infra/db/prisma.service";
// import { CreateClientDbDto } from "@/users/interface/dto/create-client-db.dto";
import { CreateUserDbDto } from "@/core/interface/dto/create-user-db.dto";
import { Prisma, User } from '@prisma/client';
import { Injectable } from "@nestjs/common";
import { IUserRepositoryForEmail } from "@/email/domain/repository/iUser.repository";
// import { IUserRepoForEmail } from "@/email/application/port/iUserRepo.service";
// import { iUserRepositoryForClientAdmins } from "@/client-admins/application/ports/iUser.repository";
// import { IUserRepositoryForCore } from "@/core/application/port/iUser.repository";

@Injectable()
export class UserRepository implements IUserRepositoryForEmail {
  constructor(private readonly prisma: PrismaService) {}

  // ! 테스트중 , 테스트 후 지우기기
  // async createClient(clientDbDto: CreateClientDbDto) {
  //     console.log("test");
  //     try {
  //       // PrismaService 인스턴스 자체를 출력
  //       console.log("PrismaService Instance:", this.prisma);
  //       return await this.prisma.client.create({ data: {...clientDbDto} });
  //     } catch (error) {
  //       console.error('Error creating client:', error);
  //       throw new Error('Failed to create client');
  //     }
  //   }

  async createUser(userDbDto: CreateUserDbDto): Promise<User> {
    return await this.prisma.user.create({ data: userDbDto });
  }

  async createUserWithTransaction(tx: Prisma.TransactionClient, userDto: CreateUserDbDto): Promise<User> {
    return await tx.user.create({
      data: userDto,
    });
  }

  async getUserById(id: string): Promise<User> {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async getUserByEmail(email: string): Promise<User> {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async updateUser(id: string, data: any) {
    return await this.prisma.user.update({ where: { id }, data });
  }

  async updateUserVerifiedTrue(email: string): Promise<User> {
    return await this.prisma.user.update({ where: { email }, data: { verified: true } });
  }

  async deleteUser(id: string): Promise<User>  {
    return await this.prisma.user.delete({
        where: { id },
    });
  }

  async getAllUsers(clientId: string) {
    return await this.prisma.user.findMany({ where: { clientId } });
  }

  async findOne(id: string): Promise<User> {
    return await this.prisma.user.findFirst({ where: { id } });
  }

  async findOneForClientAdmin(id: string, clientId: string): Promise<User> {
    return await this.prisma.user.findFirst({ where: { id, clientId } });
  }

  async findUserByEmail(email: string): Promise<User> {
    return await this.prisma.user.findFirst({ where: {email} });
  }

  async findUserBySignupVerifyToken(signupVerifyToken: string): Promise<User> {
    return await this.prisma.user.findFirst({ where: {signupVerifyToken} });
  }
}