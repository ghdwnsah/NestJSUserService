import { Role } from "@/core/common/roles/role.enum";
import { Roles } from "@/core/common/roles/roles.decorator";
import { RolesGuard } from "@/core/common/roles/roles.guard";
import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CreateUserDto } from "../dto/create-user.dto";
import { CreateClientDto } from "../dto/create-client.dto";
import { ClientService } from "@/users/application/services/client.service";

// TODO : 하위 관리자 컨트롤러
@UseGuards(RolesGuard)
@Roles(Role.ClientAdmin)
@Controller('/users/client')
export class ClientController {

  constructor(
    private readonly clientService: ClientService
  ) {}

  // 가입은 모든 권한자들에게 허용
  @Roles(Role.SuperAdmin, Role.ClientAdmin, Role.ClientUser)
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

    return await this.clientService.createClient(
      userInfo.name, userInfo.email, userInfo.password,
      clientInfo.name);
  }
  

  @Get()
  getAllUsers() {
    return 'ClientAdmin: 자기 클라이언트 유저 목록 조회';
  }
}