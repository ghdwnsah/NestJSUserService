import { Controller, Post, Body, Query, Ip, Patch, Param, Get, Res } from '@nestjs/common';
import { VerifyAndLoginUseCase } from '../verifyAndLogin.usecase';
import { Role } from '@/core/common/roles/role.enum';
import { Roles } from '@/core/common/roles/roles.decorator';
import { VerifyEmailDto } from '@/email/interface/dto/verifyEmail.dto';
import { UserLoginDto } from '@/core/interface/dto/login-user.dto';
import { LoginUserCommand } from '../application/command/login-user.command';
import { CommandBus } from '@nestjs/cqrs';
import { VerifyUserEmailCommand } from '../application/command/verify-userEmail.command';
import { UpdateResetPasswordConfirmCommand } from '../application/command/update-resetPasswordConfirm.command';
import { UpdateResetPasswordRequestCommand } from '../application/command/update-resetPasswordRequest.command';
import { Response } from 'express';
import { join } from 'path';



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

    @Roles()
    @Post('/users/auth/reset-password/request')
    async resetPasswordRequest(@Body() body: any): Promise<{ message: string }> {
      const { id } = body;

      const command = new UpdateResetPasswordRequestCommand(id);
      return this.commandBus.execute(command);
    }

    @Roles()
    @Get('/users/auth/reset-password/page')
    async resetPasswordPage(@Query() token: string, @Res() res: Response) {
      return res.sendFile(join(__dirname, '..', '..', 'public', 'reset-password.html'));
    }

    @Roles()
    @Post('/users/auth/reset-password/confirm')
    async resetPassword(@Body() body: { token: string; newPassword: string }, @Ip() ip: string) {
      const { token, newPassword } = body;
      
      const command = new UpdateResetPasswordConfirmCommand(token, newPassword);
      return this.commandBus.execute(command);
    }
}
