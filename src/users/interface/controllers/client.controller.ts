import { Role } from "@/core/common/roles/role.enum";
import { Roles } from "@/core/common/roles/roles.decorator";
import { RolesGuard } from "@/core/common/roles/roles.guard";
import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";

// TODO : 하위 관리자 컨트롤러
@UseGuards(RolesGuard)
@Roles(Role.ClientAdmin)
@Controller('/users/client')
export class ClientController {

  
  @Post()
  createUser(@Body() data: any) {
    return `ClientAdmin: 유저 생성 - ${data.name}`;
  }

  @Get()
  getAllUsers() {
    return 'ClientAdmin: 자기 클라이언트 유저 목록 조회';
  }
}