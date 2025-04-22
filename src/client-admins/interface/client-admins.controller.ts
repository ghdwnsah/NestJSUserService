import { iClientAdminsServiceForClientAdmins } from "@/client-admins/application/port/iClientAdmins.service";
import { Role } from "@/core/common/roles/role.enum";
import { Roles } from "@/core/common/roles/roles.decorator";
import { RolesGuard } from "@/core/common/roles/roles.guard";
import { Body, Controller, DefaultValuePipe, Delete, Get, Inject, Ip, Param, ParseIntPipe, Patch, Post, Query, Res, UseGuards } from "@nestjs/common";
import { CreateClientAdminDto } from "./dto/create-client-admin.dto";
import { CreateClientAdminUserResponse } from "./reponse/createClientAdminUser.response";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { UserLoginDto } from "@/core/interface/dto/login-user.dto";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateClientAdminCommand } from "../application/command/create-clientadmin.command";
import { UserInfo } from "@/core/interface/userInfo";
import { GetClientUserInfoQuery } from "../application/query/get-clientUserInfo.query";
import { User } from "@/auth/user.decorator";
import { UpdateResetPasswordRequestCommand } from "../../auth/application/command/update-resetPasswordRequest.command";

// TODO : 하위 관리자 컨트롤러
@Roles(Role.ClientAdmin)
@Controller('/users/client')
export class ClientAdminsController {
    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus,
    ) {}

    // 가입은 모든 사람에게 허용
    // TODO : 추후 클라이언트 코드 생성 후 이를 통해 맵핑 시켜 가입 받기
    @UseGuards()
    @Roles()
    @Post()
    async createClient(@Body() createClientUserDto: CreateClientAdminDto): Promise<CreateClientAdminUserResponse> {
        const clientAdminInfo = {
            name: createClientUserDto.name,
            email: createClientUserDto.email,
            password: createClientUserDto.password,
            clientName: createClientUserDto.clientName,
        };

        const command = new CreateClientAdminCommand(clientAdminInfo.name, clientAdminInfo.email, clientAdminInfo.password, clientAdminInfo.clientName);
        return this.commandBus.execute(command);
    }

    @UseGuards(JwtAuthGuard)
    @Roles(Role.ClientAdmin)
    @Get()
    async findOne(
        @Param('id') userId: string,
    ): Promise<UserInfo> {
        const query = new GetClientUserInfoQuery(userId);
		return this.queryBus.execute(query);
    }

    // @Get()
    // async findAll(
    //     @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    //     @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    //     @Res() res
    // ) {
    //     const users = await this.clientAdminsService.findAll(offset, limit);

    //     return res
    //             .status(200)
    //             .send(users);
    // }

    // @Delete(':id')
    // async deleteUser(@Param('id') id: string): Promise<User> {
    //     return await this.clientAdminsService.deleteUser(id);
    // }

    // @Patch(':id')
    // async updateUser(
    //     @Param('id') id: string,
    //     @Body() updateData: any
    // ): Promise<User> {
    //     return await this.clientAdminsService.updateUser(id, updateData);
    // }
}