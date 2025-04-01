import { PrismaService } from "@/core/infra/db/prisma.service";
import { CreateClientDbDto } from "@/users/interface/dto/create-client-db.dto";
import { CreateClientDto } from "@/users/interface/dto/create-client.dto";
import { CreateUserDto } from "@/users/interface/dto/create-user.dto";

export class ClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createClient(clientDbDto: CreateClientDbDto) {
    await this.prisma.client.create({ data: clientDbDto });
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
}