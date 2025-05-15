import { EXAMPLES } from "@/shared/swagger/example";
import { ApiProperty } from "@nestjs/swagger";

export class VerifyEmailDto {
    code: string;   // 암호화 된 클라이언트 코드

    @ApiProperty({ example: EXAMPLES.token.signupVerifyToken.value, description: EXAMPLES.token.signupVerifyToken.desc })
    signupVerifyToken: string;
}