import { AuthService } from "@/core/common/auth/auth.service";
import { UserRepository } from "@/users/infra/db/repository/user.repository";
import { Injectable, NotAcceptableException, NotFoundException } from "@nestjs/common";

@Injectable()
export class VerifyUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(signupVerifyToken: string, ip: string) {
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