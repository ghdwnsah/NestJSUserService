import { Inject, Injectable, NotAcceptableException, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { VerifyUserEmailCommand } from "./verify-userEmail.command";
import { IUserRepositoryForAuth } from "@/auth/infra/adaper/iUser.repository";
import { AuthService } from "../auth.service";
import { TenantUserRepository } from "@/core/infra/db/repo/tenant-user.repository";
import { decryptClientCode } from "@/core/common/utils/crypto";

@Injectable()
@CommandHandler(VerifyUserEmailCommand)
export class VerifyUserEmailHandler implements ICommandHandler<VerifyUserEmailCommand>{
    constructor (
        private readonly authService: AuthService,
        @Inject('UserRepository') private userRepository: IUserRepositoryForAuth,
        private readonly tenantUserRepository: TenantUserRepository,
    ) {}

    async execute(command: VerifyUserEmailCommand): Promise<any> {
        const { encryptedClientCode, signupVerifyToken, ip } = command;
        
        const clientCode = decryptClientCode(encryptedClientCode);
        const user = await this.tenantUserRepository.findUserBySignupVerifyToken(clientCode, signupVerifyToken);
        if (!user) throw new NotFoundException('유저가 존재하지 않습니다.');
        if (user.verified) throw new NotAcceptableException('이미 가입이 완료된 유저입니다.');
    
        await this.tenantUserRepository.updateUserVerifiedTrue(clientCode, user.email);
        return this.authService.tenantLogin(
            clientCode,
            { 
                id: user.id,
                name: user.name,
                email: user.email,
                clientId: user.clientId,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
            }, ip);
    }
}