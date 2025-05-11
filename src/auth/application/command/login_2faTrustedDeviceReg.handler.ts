import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { LoginUserCommand } from "./login-user.command";
import { AuthService } from "../auth.service";

import { UserInfo } from "@/core/interface/userInfo";
import { LoginResponse } from "@/email/interface/response/login.response";

import { IUserRepositoryForAuth } from "@/auth/infra/adaper/iUser.repository";

import * as bcrypt from 'bcrypt';
import { IRefreshTokenRepositoryForAuth } from "@/auth/infra/adaper/iRefreshToken.repository";
import { JwtService } from "@nestjs/jwt";

import { v4 as uuidv4 } from 'uuid';
import { addMinutes } from "date-fns";
import { Login2faTrustedDeviceRegCommand } from "./login_2faTrustedDeviceReg.command";
import { Login2faResponse } from "@/email/interface/response/2fa_login.response";
import { TwoFactorAuthService } from "../twoFactorAuth.service";

@Injectable()
@CommandHandler(Login2faTrustedDeviceRegCommand)
export class Login2faTrustedDeviceRegHandler implements ICommandHandler<Login2faTrustedDeviceRegCommand> {
    constructor (
      private readonly authService: AuthService,
      private readonly jwtService: JwtService,
      private readonly twoFactorAuthService: TwoFactorAuthService,

      @Inject('UserRepository') private userRepository: IUserRepositoryForAuth,
      @Inject('RefreshTokenRepository') private refreshTokenRepository: IRefreshTokenRepositoryForAuth
    ) {}

    async execute(command: Login2faTrustedDeviceRegCommand): Promise<Login2faResponse> {    
      const { email, otp, ip, userAgent, deviceName } = command;

      const user = await this.userRepository.findUserByEmail(email);
      if (!user || !user.twoFactorSecret || !user.isTwoFactorEnabled) {
        throw new UnauthorizedException('2FA가 활성화되지 않았습니다.');
      }
  
      const isValid = this.twoFactorAuthService.isCodeValid(otp, user.twoFactorSecret);
      if (!isValid) {
        throw new UnauthorizedException('잘못된 OTP입니다.');
      }
  
      // deviceToken 생성
      const deviceToken = this.twoFactorAuthService.generateDeviceToken();
      await this.userRepository.registerTrustedDevice({
        userId: user.id,
        deviceToken,
        deviceName: deviceName ?? 'Unknown device',
        ipAddress: ip,
        userAgent,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      });
  
      const loginResponse: LoginResponse = await this.authService.login({
        id: user.id,
        name: user.name,
        email: user.email,
        clientId: user.clientId,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      }, ip)
      return {...loginResponse, deviceToken};
    }
}