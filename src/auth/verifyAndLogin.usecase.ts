import { Inject, Injectable, NotAcceptableException, NotFoundException } from "@nestjs/common";
import { AuthService } from "./application/auth.service";
import { LoginResponse } from "@/email/interface/response/login.response";
import { IUserRepositoryForAuth } from "./infra/adaper/iUser.repository";

@Injectable()
export class VerifyAndLoginUseCase {
    constructor(
        private readonly authService: AuthService,
        @Inject('UserRepository') private userRepository: IUserRepositoryForAuth,
    ) {}

    async execute(signupVerifyToken: string, ip: string): Promise<LoginResponse> {
        const user = await this.userRepository.findUserBySignupVerifyToken(signupVerifyToken);
        if (!user) throw new NotFoundException('유저가 존재하지 않습니다.');
        if (user.verified) throw new NotAcceptableException('이미 가입이 완료된 유저입니다.');
    
        await this.userRepository.updateUserVerifiedTrue(user.email);
        return this.authService.login({
            id: user.id,
            name: user.name,
            email: user.email,
            clientId: user.clientId,
        }, ip);
    }
}