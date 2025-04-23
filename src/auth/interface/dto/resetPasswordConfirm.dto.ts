import { EXAMPLES } from "@/shared/swagger/example";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordConfirmDto {
    @ApiProperty({ example: EXAMPLES.token.resetPasswordToken.value, description: EXAMPLES.token.resetPasswordToken.desc })
    resetPasswordToken: string;
    @ApiProperty({ example: EXAMPLES.user.password.value, description: EXAMPLES.user.password.desc })
    newPassword: string;
}