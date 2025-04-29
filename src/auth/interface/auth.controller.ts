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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiDefaultResponses } from '@/shared/swagger/api-default-responses.decorator';
import { ResetPasswordRequestDto } from './dto/resetPasswordRequest.dto';
import { ResetPasswordConfirmDto } from './dto/resetPasswordConfirm.dto';
import { UpdateRefreshAccessTokenCommand } from '../application/command/update-refreshAccessToken.command';
import { RefreshAccessTokenDto } from '@/client-admins/interface/dto/update-refreshAccessToken.dto';

@ApiTags('Auth')
@Controller('/')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
  ) {}
    @ApiOperation({ summary: '유저 이메일 인증', description: '유저에 대한 이메일 인증' })
    @ApiDefaultResponses()
    @Roles()
    @Post('/users/email/auth/verify')
    async verifyEmail(@Query() dto: VerifyEmailDto, @Ip() ip: string) {
        const { signupVerifyToken } = dto;

        const command = new VerifyUserEmailCommand(signupVerifyToken, ip);
        return this.commandBus.execute(command);
    }

    @ApiOperation({ summary: '유저 로그인', description: '유저에 대한 로그인' })
    @ApiDefaultResponses()
    @Roles()
    @Post('/users/auth/login')
    async login(@Body() dto: UserLoginDto, @Ip() ip: string) {
      const { email, password } = dto;
      
      const command = new LoginUserCommand(email, password, ip);
      return this.commandBus.execute(command);
    }

    @ApiOperation({ summary: '유저 액세스 토큰 재발급', description: '리프레쉬 토큰을 통한 액세스 토큰 재발급' })
    @ApiDefaultResponses()
    @Roles()
    @Post('/users/auth/refresh')
    async refreshAccessToken(@Body() refreshTokenDto: RefreshAccessTokenDto, @Ip() ip: string) {
      const { refreshToken, id } = refreshTokenDto;
      
      const command = new UpdateRefreshAccessTokenCommand(id, refreshToken, ip);
      return this.commandBus.execute(command);
    }

    @ApiOperation({ summary: '유저 비밀번호 찾기/변경 요청', description: '유저에 대한 비밀번호 찾기/변경' })
    @ApiDefaultResponses()
    @Roles()
    @Post('/users/auth/reset-password/request')
    async resetPasswordRequest(@Body() body: ResetPasswordRequestDto): Promise<{ message: string }> {
      const { id } = body;

      const command = new UpdateResetPasswordRequestCommand(id);
      return this.commandBus.execute(command);
    }

    @ApiOperation({ summary: '유저 비밀번호 변경 페이지', description: '유저에 대한 비밀번호 페이지' })
    @ApiDefaultResponses()
    @Roles()
    @Get('/users/auth/reset-password/page')
    async resetPasswordPage(@Query() token: string, @Res() res: Response) {
      return res.sendFile(join(__dirname, '..', '..', 'public', 'reset-password.html'));
    }

    @ApiOperation({ summary: '유저 비밀번호 변경 확인', description: '유저에 대한 비밀번호 확인' })
    @Roles()
    @Post('/users/auth/reset-password/confirm')
    async resetPassword(@Body() body: ResetPasswordConfirmDto, @Ip() ip: string) {
      const { resetPasswordToken, newPassword } = body;
      
      const command = new UpdateResetPasswordConfirmCommand(resetPasswordToken, newPassword);
      return this.commandBus.execute(command);
    }
}
