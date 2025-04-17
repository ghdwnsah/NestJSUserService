import { Controller, Post, Body, Query, Ip } from '@nestjs/common';
import { VerifyAndLoginUseCase } from '../verifyAndLogin.usecase';
import { Role } from '@/core/common/roles/role.enum';
import { Roles } from '@/core/common/roles/roles.decorator';
import { VerifyEmailDto } from '@/email/interface/dto/verifyEmail.dto';


@Controller('/auth')
export class AuthController {
  constructor(private readonly verifyAndLogin: VerifyAndLoginUseCase) {}

    // 이메일 인증은 모든 권한자에게 허용
    @Roles(Role.SuperAdmin, Role.ClientAdmin, Role.ClientUser)
    @Post('/email/verify')
    async verifyEmail(@Query() dto: VerifyEmailDto, @Ip() ip: string) {
        const { signupVerifyToken } = dto;

        return await this.verifyAndLogin.execute(signupVerifyToken, ip);
    }
}
