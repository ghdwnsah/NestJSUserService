import { Role } from "@/core/common/roles/role.enum";
import { Roles } from "@/core/common/roles/roles.decorator";
import { Body, Controller, Inject, Logger, LoggerService, Post, Req } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiTags } from "@nestjs/swagger";
import { CreateClientUserDto } from "./dto/create-clientUser.dto";
import { CreateClientUserResponse } from "./response/createClientUser.response";
import { CreateClientUserCommand } from "../application/command/create-clientUser.command";
import { Public } from "@/core/common/decorator/public.decorator";

@ApiTags('Client Users')
@Roles(Role.ClientUser)
@Controller('/users/client')
export class ClientUsersController {
    constructor(
            private commandBus: CommandBus,            
            @Inject(Logger) private readonly logger: LoggerService,
        ) {}
        
    @Public()
    @Post()
    async createClientUser(@Req() req, @Body() createClientUserDto: CreateClientUserDto): Promise<CreateClientUserResponse> {
        const { name, email, password } = createClientUserDto;
        const clientCode = req.tenantId;
        
        const command = new CreateClientUserCommand(name, email, password, clientCode);
        return this.commandBus.execute(command);
    }
}