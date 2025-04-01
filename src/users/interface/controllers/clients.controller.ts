import { Role } from "@/core/common/roles/role.enum";
import { Roles } from "@/core/common/roles/roles.decorator";
import { RolesGuard } from "@/core/common/roles/roles.guard";
import { ClientService } from "@/users/application/services/client.service";
import { CreateClientUseCase } from "@/users/application/use-cases/create-client.usecase";
import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CreateClientDto } from "../dto/create-client.dto";
import { CreateUserDto } from "../dto/create-user.dto";
import { ClientsService } from "@/users/application/services/clients.service";

// TODO : 관리자 컨트롤러
@UseGuards(RolesGuard)
@Roles(Role.SuperAdmin)
@Controller('/users/clients')
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService
  ) {}
  
  @Post()
  async createClient(@Body() userDto: CreateUserDto, clientDto: CreateClientDto) {
    const userInfo = {
      name: userDto.name,
      email: userDto.email,
      password: userDto.password,
    };
    const clientInfo = { 
      name: clientDto.name,
    }

    return await this.clientsService.createClient(
      userInfo.name, userInfo.email, userInfo.password,
      clientInfo.name);
  }

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