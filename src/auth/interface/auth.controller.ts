import { Controller, Post, Body, Query, Ip } from '@nestjs/common';
import { VerifyAndLoginUseCase } from '../verifyAndLogin.usecase';
import { Role } from '@/core/common/roles/role.enum';
import { Roles } from '@/core/common/roles/roles.decorator';
import { VerifyEmailDto } from '@/email/interface/dto/verifyEmail.dto';
import { UserLoginDto } from '@/core/interface/dto/login-user.dto';
import { LoginUserCommand } from '../application/command/login-user.command';
import { CommandBus } from '@nestjs/cqrs';
import { VerifyUserEmailCommand } from '../application/command/verify-userEmail.command';


@Controller('/')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
  ) {}

    @Roles()
    @Post('/users/email/auth/verify')
    async verifyEmail(@Query() dto: VerifyEmailDto, @Ip() ip: string) {
        const { signupVerifyToken } = dto;

        const command = new VerifyUserEmailCommand(signupVerifyToken, ip);
        return this.commandBus.execute(command);
    }

    @Roles()
    @Post('/users/auth/login')
    async login(@Body() dto: UserLoginDto, @Ip() ip: string) {
      const { email, password } = dto;
      
      const command = new LoginUserCommand(email, password, ip);
      return this.commandBus.execute(command);
    }
}
