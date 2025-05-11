import { BadRequestException, Inject, Injectable } from "@nestjs/common";
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

@Injectable()
@CommandHandler(VerifyGenerateTwoFactorQrCommand)
export class VerifyGenerateTwoFactorQrHandler implements ICommandHandler<VerifyGenerateTwoFactorQrCommand> {
    constructor (
        @Inject('UserRepository') private readonly userRepository: IUserRepositoryForAuth,
        private readonly twoFactorAuthService: TwoFactorAuthService,
        private readonly eventBus: EventBus,
    ) {}

    async execute(command: VerifyGenerateTwoFactorQrCommand): Promise<any> {
        console.log('들어옴 1 : ');
        const { userId, email, isTwoFactorEnabled } = command;

        // 2FA 이미 활성화된 사용자는 다시 QR 생성 불가 (원한다면 예외처리)
        if (isTwoFactorEnabled) {
            throw new BadRequestException('이미 2FA가 활성화된 사용자입니다.');
        }
        // 1) 시크릿 및 OTPAuth URL 생성
        const { secret, otpAuthUrl } = this.twoFactorAuthService.generateSecret(email);
        // 2) (임시) 시크릿을 DB에 저장해 둠 (추후 코드 확인용)
        await this.userRepository.setTwoFactorSecret(userId, secret);
        // 3) OTPAuth URL을 QR코드 이미지 PNG로 변환하여 응답 (stream 또는 base64)
        // 방법 1: qrcode 패키지로 data URL 생성 후 JSON 반환
        const qrBuffer = await qrcode.toBuffer(otpAuthUrl);
        return qrBuffer;
        // 방법 2: qr-image 등으로 PNG 바이트 스트림 생성 후 content-type 이미지로 응답
        
    }
}