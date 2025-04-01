import { Role } from "@/core/common/roles/role.enum";
import { Roles } from "@/core/common/roles/roles.decorator";
import { RolesGuard } from "@/core/common/roles/roles.guard";
import { CreateClientUseCase } from "@/users/application/use-cases/create-client.usecase";
import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CreateClientDto } from "../dto/create-client.dto";
import { CreateUserDto } from "../dto/create-user.dto";

// TODO : 관리자 컨트롤러
@UseGuards(RolesGuard)
@Roles(Role.SuperAdmin)
@Controller('/users/clients')
export class ClientsController {
  constructor(
    // private readonly clientService: ClientService
  ) {}
  
  @Post('/users')
  async createClientUser(@Body() data: any) {
    return `SuperAdmin: 클라이언트 하위 유저 생성 - ${data.name}`;
    // return await this.createClientUseCase.execute(data);
  }

  @Get()
  getAllClients() {
    return 'SuperAdmin: 모든 클라이언트 조회';
  }
}