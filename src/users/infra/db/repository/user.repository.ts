import { PrismaService } from "@/core/infra/db/prisma.service";
import { CreateUserDbDto } from "@/users/interface/dto/create-user-db.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(userDbDto: CreateUserDbDto) {
    return await this.prisma.user.create({ data: userDbDto });
  }

  async getUserById(id: string) {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async updateUser(id: string, data: any) {
    return await this.prisma.user.update({ where: { id }, data });
  }

  async deleteUser(id: string) {
    return await this.prisma.user.delete({ where: { id } });
  }

  async getAllUsers() {
    return await this.prisma.user.findMany();
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user.findFirst({ where: {email} });
  }
}