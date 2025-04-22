import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateResetPasswordConfirmCommand } from "./update-resetPasswordConfirm.command";
import { IUserRepositoryForAuth } from "@/auth/infra/adaper/iUser.repository";
import { hashPassword } from "@/core/common/validators/password.validator";

@Injectable()
@CommandHandler(UpdateResetPasswordConfirmCommand)
export class UpdateResetPasswordConfirmHandler implements ICommandHandler<UpdateResetPasswordConfirmCommand>{
    constructor (
        @Inject('UserRepository') private userRepository: IUserRepositoryForAuth,
    ) {}

    async execute(command: UpdateResetPasswordConfirmCommand): Promise<any> {
        const { token, newPassword } = command;
        const user = await this.userRepository.findResetPasswordValidToken(token);
          if (!user) {
            throw new UnauthorizedException('유효하지 않거나 만료된 토큰입니다.');
          }
        
          const hashedPassword = await hashPassword(newPassword);
        
          await this.userRepository.updatePassword(user.id, hashedPassword)
        
          return { message: '비밀번호가 성공적으로 변경되었습니다.' };
    }
}