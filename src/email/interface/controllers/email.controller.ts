import { Role } from "@/core/common/roles/role.enum";
import { Roles } from "@/core/common/roles/roles.decorator";
import { Controller, Ip, Post, Query } from "@nestjs/common";
import { VerifyEmailDto } from "../dto/verifyEmail.dto";
import { NodemailerEmailService } from "@/email/infra/nodemailer-email.service";
// import { VerifyEmailUseCase } from "@/email/application/usecase/verifyEmail.usecase";

@Controller('/users/email')
export class EmailController {
    constructor (
        // private readonly verifyEmailUseCase: VerifyEmailUseCase
    ) {}

    // 이메일 인증은 모든 권한자에게 허용
    // @Roles(Role.SuperAdmin, Role.ClientAdmin, Role.ClientUser)
    // @Post('/verify')
    // async verifyEmail(@Query() dto: VerifyEmailDto, @Ip() ip: string) {
    //     const { signupVerifyToken } = dto;

    //     return await this.verifyEmailUseCase.execute(signupVerifyToken, ip);
    // }
}