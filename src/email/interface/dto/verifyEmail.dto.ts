import { EXAMPLES } from "@/shared/swagger/example";
import { ApiProperty } from "@nestjs/swagger";

export class VerifyEmailDto {
    @ApiProperty({ example: EXAMPLES.token.signupVerifyToken.value, description: EXAMPLES.token.signupVerifyToken.desc })
    signupVerifyToken: string;
}