import { Inject, Injectable, NotAcceptableException, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { VerifyUserEmailCommand } from "./verify-userEmail.command";
import { IUserRepositoryForAuth } from "@/auth/infra/adaper/iUser.repository";
import { AuthService } from "../auth.service";

@Injectable()
@CommandHandler(VerifyUserEmailCommand)
export class VerifyUserEmailHandler implements ICommandHandler<VerifyUserEmailCommand>{
    constructor (
        private readonly authService: AuthService,
        @Inject('UserRepository') private userRepository: IUserRepositoryForAuth,
    ) {}

    async execute(command: VerifyUserEmailCommand): Promise<any> {
        const { signupVerifyToken, ip } = command;
        const user = await this.userRepository.findUserBySignupVerifyToken(signupVerifyToken);
        if (!user) throw new NotFoundException('유저가 존재하지 않습니다.');
        if (user.verified) throw new NotAcceptableException('이미 가입이 완료된 유저입니다.');
    
        await this.userRepository.updateUserVerifiedTrue(user.email);
        return this.authService.login({
            id: user.id,
            name: user.name,
            email: user.email,
        }, ip);
    }
}