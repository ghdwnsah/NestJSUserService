import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { UpdateResetPasswordRequestCommand } from "./update-resetPasswordRequest.command";

import { v4 as uuidv4 } from 'uuid';
import { addMinutes } from "date-fns";
import { ClientAdminsRepository } from "@/client-admins/infra/db/client-admins.repository";
import { ResetPasswordEvent } from "@/core/domain/resetPassword-event";
import { iUserRepositoryForClientAdmins } from "@/client-admins/infra/adapter/iUser.repository";
import { IUserRepositoryForAuth } from "@/auth/infra/adaper/iUser.repository";
import { VerifyGenerateTwoFactorQrCommand } from "./verify_generateTwoFactorQr.command";
import { TwoFactorAuthService } from "../twoFactorAuth.service";
import * as qrcode from 'qrcode';
import { VerifyTwoFactorOtpCommand } from "./verify_twoFactorOtp.command.";
import { verify2faResponse } from "@/auth/interface/response/verify2fa.response";

@Injectable()
@CommandHandler(VerifyTwoFactorOtpCommand)
export class VerifyTwoFactorOtpHandler implements ICommandHandler<VerifyTwoFactorOtpCommand> {
    constructor (
        @Inject('UserRepository') private readonly userRepository: IUserRepositoryForAuth,
        private readonly twoFactorAuthService: TwoFactorAuthService,
        private readonly eventBus: EventBus,
    ) {}

    async execute(command: VerifyTwoFactorOtpCommand): Promise<verify2faResponse> {
      console.log('execute() called with command:', command);
        const { userId, otp, ip, userAgent } = command;
        const user = await this.userRepository.findUserById(userId);
    
        if (!user || !user.twoFactorSecret) {
          throw new UnauthorizedException('2FA 설정이 완료되지 않았습니다.');
        }
    
        const isValid = this.twoFactorAuthService.isCodeValid(otp, user.twoFactorSecret);
    
        if (!isValid) {
          throw new UnauthorizedException('잘못된 인증 코드입니다.');
        }
    
        // 인증 성공 → DB에 2FA 활성화 플래그 저장
        await this.userRepository.setIsTwoFactorAuth(userId, true);

        // deviceToken 생성 및 저장
        const deviceToken = this.twoFactorAuthService.generateDeviceToken();
        await this.userRepository.registerTrustedDevice({
          userId: user.id,
          deviceToken,
          deviceName: "내 기기",
          ipAddress: ip,
          userAgent,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        });

    
        return { deviceToken };
        
    }
}