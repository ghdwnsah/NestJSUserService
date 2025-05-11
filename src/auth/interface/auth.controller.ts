import { Controller, Post, Body, Query, Ip, Patch, Param, Get, Res, UseGuards, Req, BadRequestException, Inject } from '@nestjs/common';
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
import { Public } from '@/core/common/decorator/public.decorator';
import { GoogleAuthGuard } from '../common/guard/google-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { GoogleSocialCreateOrLoginCommand } from '../application/command/google_socialCreateOrLogin.command';
import { GoogleLoginGuard } from '../common/guard/google-login.guard';
import { TwoFactorAuthService } from '../application/twoFactorAuth.service';
import { JwtAuthGuard } from '../common/guard/jwt-auth.guard';
import { IUserRepositoryForAuth } from '../infra/adaper/iUser.repository';
import { VerifyGenerateTwoFactorQrCommand } from '../application/command/verify_generateTwoFactorQr.command';
import { VerifyTwoFactorOtpCommand } from '../application/command/verify_twoFactorOtp.command.';
import { Login2faResponse } from '@/email/interface/response/2fa_login.response';
import { Login2faTrustedDeviceRegCommand } from '../application/command/login_2faTrustedDeviceReg.command';
import { verify2faResponse } from './response/verify2fa.response';


@ApiTags('Auth')
@Controller('/')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly twoFactorAuthService: TwoFactorAuthService,
    @Inject('UserRepository') private readonly userRepository: IUserRepositoryForAuth,
  ) {}
    @ApiOperation({ summary: '유저 이메일 인증', description: '유저에 대한 이메일 인증' })
    @ApiDefaultResponses()
    @Public()
    @Post('/users/email/auth/verify')
    async verifyEmail(@Query() dto: VerifyEmailDto, @Ip() ip: string) {
        const { signupVerifyToken } = dto;

        const command = new VerifyUserEmailCommand(signupVerifyToken, ip);
        return this.commandBus.execute(command);
    }

    @ApiOperation({ summary: '유저 로그인', description: '유저에 대한 로그인' })
    @ApiDefaultResponses()
    @Public()
    @Post('/users/auth/login')
    async login(@Body() dto: UserLoginDto, @Ip() ip: string) {
      const { email, password } = dto;
      
      const command = new LoginUserCommand(email, password, ip);
      return this.commandBus.execute(command);
    }

    @ApiOperation({ summary: '유저 액세스 토큰 재발급', description: '리프레쉬 토큰을 통한 액세스 토큰 재발급' })
    @ApiDefaultResponses()
    @Public()
    @Post('/users/auth/refresh')
    async refreshAccessToken(@Body() refreshTokenDto: RefreshAccessTokenDto, @Ip() ip: string) {
      const { refreshToken, id } = refreshTokenDto;
      
      const command = new UpdateRefreshAccessTokenCommand(id, refreshToken, ip);
      return this.commandBus.execute(command);
    }

    @ApiOperation({ summary: '유저 비밀번호 찾기/변경 요청', description: '유저에 대한 비밀번호 찾기/변경' })
    @ApiDefaultResponses()
    @Public()
    @Post('/users/auth/reset-password/request')
    async resetPasswordRequest(@Body() body: ResetPasswordRequestDto): Promise<{ message: string }> {
      const { id } = body;

      const command = new UpdateResetPasswordRequestCommand(id);
      return this.commandBus.execute(command);
    }

    @ApiOperation({ summary: '유저 비밀번호 변경 페이지', description: '유저에 대한 비밀번호 페이지' })
    @ApiDefaultResponses()
    @Public()
    @Get('/users/auth/reset-password/page')
    async resetPasswordPage(@Query() token: string, @Res() res: Response) {
      return res.sendFile(join(__dirname, '..', '..', 'public', 'reset-password.html'));
    }

    @ApiOperation({ summary: '유저 비밀번호 변경 확인', description: '유저에 대한 비밀번호 확인' })
    @ApiDefaultResponses()
    @Public()
    @Post('/users/auth/reset-password/confirm')
    async resetPassword(@Body() body: ResetPasswordConfirmDto, @Ip() ip: string) {
      const { resetPasswordToken, newPassword } = body;
      
      const command = new UpdateResetPasswordConfirmCommand(resetPasswordToken, newPassword);
      return this.commandBus.execute(command);
    }

    //TODO : 권한 별 소셜 회원가입/로그인 구분 필요, 우선 가드 쪽에 임시 하드코딩 구현
    @ApiOperation({ summary: '(구글)유저 소셜 로그인', description: '소셜 로그인, 구글' })
    @ApiDefaultResponses()
    @UseGuards(GoogleLoginGuard)
    @Get('/users/auth/google')
    async googleLogin(@Query('role') role: Role = Role.ClientUser, @Query('clientCode') clientCode: string) {
      // 구글 로그인 URL로 리다이렉트됨
      // 이곳은 사용되지 않음
      return;
    }

    //TODO : 권한 별 소셜 회원가입/로그인 구분 필요, 우선 임시 하드코딩 구현
    @UseGuards(GoogleAuthGuard)
    @Get('/users/auth/google/callback')
    async googleLoginCallback(@Req() req, @Ip() ip: string) {
      console.log('googleLoginCallback()');
      const user = req.user; 
      const stateRaw = req.query.state;
      const { role, clientCode } = JSON.parse(stateRaw);
      console.log('stateRaw json : ', role, clientCode);

      const command = new GoogleSocialCreateOrLoginCommand(user.email, user.name, user.accessToken, ip, role, clientCode);
      return this.commandBus.execute(command);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/users/auth/2fa/qrcode')
    async generateTwoFactorQR(@Req() req, @Res() res: Response) {
      console.log('generateTwoFactorQR(), req.user : ');
      console.log('generateTwoFactorQR(), req.user : ', req.user);
      const user = req.user;
      
      const command = new VerifyGenerateTwoFactorQrCommand(user.id, user.email, user.isTwoFactorEnabled);
      const qrBuffer = await this.commandBus.execute(command);

      res.setHeader('Content-Type', 'image/png');
      res.send(qrBuffer); // 실제 이미지 응답
    }

    @UseGuards(JwtAuthGuard)
    @Post('/users/auth/2fa/verify')
    async verifyTwoFactorAuth(
      @Req() req, 
      @Body() body: { otp: string },
      @Ip() ip: string): Promise<verify2faResponse> {
      const { otp }= body;
      console.log('verifyTwoFactorAuth() called, otp:', otp);
      const user = req.user;
      console.log('verifyTwoFactorAuth() called, user:', user);
      const userAgent = req.headers['user-agent'] ?? 'Unknown';
      console.log('verifyTwoFactorAuth() called, userAgent:', userAgent);

      const command = new VerifyTwoFactorOtpCommand(user.id, otp, ip, userAgent);
      return this.commandBus.execute(command);
    }

    @Post('/users/auth/2fa/login')
    async loginWithTwoFactor(
      @Body() body: { email: string, deviceName: string, otp: string }, 
      @Req() req,
      @Ip() ip: string): Promise<Login2faResponse> {
      const { email, otp, deviceName } = body;
      const userAgent = req.headers['user-agent'] ?? 'Unknown';

      const command = new Login2faTrustedDeviceRegCommand(email, otp, ip, userAgent, deviceName);
      return this.commandBus.execute(command);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/users/auth/device')
    async updateTrustedDevice(@Req() req, @Body() body: { deviceId: string }) {
      const { deviceId } = body;
      const user = req.user;

      const command = new UpdateRefreshAccessTokenCommand(user.id, deviceId, user.ip);
      return this.commandBus.execute(command);  
    }




}
