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

@Injectable()
@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
    constructor (
      private readonly authService: AuthService,
      private readonly jwtService: JwtService,

      @Inject('UserRepository') private userRepository: IUserRepositoryForAuth,
      @Inject('RefreshTokenRepository') private refreshTokenRepository: IRefreshTokenRepositoryForAuth
    ) {}

    async execute(command: LoginUserCommand): Promise<LoginResponse> {
      try {
        const { email, password, ip } = command;
        const user = await this.userRepository.findUserByEmail(email);
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!user || !isPasswordValid) throw new UnauthorizedException('아이디나 비밀번호가 틀렸습니다.');
        else if (!user.verified) throw new UnauthorizedException('이메일 인증이 아직 끝나지 않았습니다.');
        
        const userInfo: UserInfo = {
          id: user.id,
          name: user.name,
          email: user.email,
          clientId: user.clientId,
        }

        await this.refreshTokenRepository.updateInvalidatePreviousRefreshTokens(userInfo.id);
        return this.authService.login({
            id: user.id,
            name: user.name,
            email: user.email,
            clientId: user.clientId,
        }, ip);
        
      } catch (e) {
        throw new UnauthorizedException('아이디나 비밀번호가 틀렸습니다.');
      }
    }
}