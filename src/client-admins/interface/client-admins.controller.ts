import { Role } from "@/core/common/roles/role.enum";
import { Roles } from "@/core/common/roles/roles.decorator";

import { Body, Controller, Get, Inject, Logger, LoggerService, Param, Post, UseGuards, UsePipes } from "@nestjs/common";
import { CreateClientAdminUserDto } from "./dto/create-client-admin.dto";
import { CreateClientAdminUserResponse } from "./response/createClientAdminUser.response";
import { JwtAuthGuard } from "@/auth/common/guard/jwt-auth.guard";

import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateClientAdminUserCommand } from "../application/command/create-clientadmin.command";
import { UserInfo } from "@/core/interface/userInfo";
import { GetClientUserInfoQuery } from "../application/query/get-clientUserInfo.query";

import { ApiOperation,  ApiTags } from "@nestjs/swagger";
import { ApiDefaultResponses } from "@/shared/swagger/api-default-responses.decorator";
import { PaidClientCheckPipe } from "@/core/infra/pipe/paidClientCheck.pipe";
import { PaidClientGuard } from "@/auth/common/guard/paidClientCheck.guard";
import { Public } from "../../core/common/decorator/public.decorator";



// TODO : 하위 관리자 컨트롤러
@ApiTags('Client Admins')
@Roles(Role.ClientAdmin)
@Controller('/users/client-admins')
export class ClientAdminsController {
    constructor(
        private commandBus: CommandBus,
        private queryBus: QueryBus,
        @Inject(Logger) private readonly logger: LoggerService,
    ) {}

    // 가입은 모든 사람에게 허용
    // TODO : 추후 클라이언트 코드 생성 후 이를 통해 맵핑 시켜 가입 받기
    @ApiOperation({ summary: 'Client Admin 가입', description: '솔루션을 제공받은 업체의 admin 유저, 추후 clientCode 와 맵핑 후 가입 받게끔 유도 예정' })
    @ApiDefaultResponses()
    @Public()
    @Post()
    async createClientAdmin(@Body() createClientUserDto: CreateClientAdminUserDto): Promise<CreateClientAdminUserResponse> {
        this.printWinstonLog(createClientUserDto);
        const clientAdminInfo = {
            name: createClientUserDto.name,
            email: createClientUserDto.email,
            password: createClientUserDto.password,
            clientName: createClientUserDto.clientName,
        };

        const command = new CreateClientAdminUserCommand(clientAdminInfo.name, clientAdminInfo.email, clientAdminInfo.password, clientAdminInfo.clientName);
        return this.commandBus.execute(command);
    }

    @ApiOperation({ summary: '유저 찾기', description: '현재는 id 기반' })
    @ApiDefaultResponses()
    @UseGuards(JwtAuthGuard, PaidClientGuard)
    @Get()
    async findOne(
        @Param('id') userId: string,
    ): Promise<UserInfo> {
        const query = new GetClientUserInfoQuery(userId);
		return this.queryBus.execute(query);
    }

    private printWinstonLog(dto) {
        console.log('printWinstonLog')
		this.logger.error('error: ', dto);
		this.logger.warn('warn: ', dto);		
		this.logger.verbose('verbose: ', dto);
		this.logger.debug('debug: ', dto);
	}
}