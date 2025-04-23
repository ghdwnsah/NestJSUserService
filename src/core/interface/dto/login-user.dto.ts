import { EXAMPLES } from "@/shared/swagger/example";
import { ApiProperty } from "@nestjs/swagger";

export class UserLoginDto{
    @ApiProperty({ example: EXAMPLES.user.email.value, description: EXAMPLES.user.email.desc })
    email: string;
    @ApiProperty({ example: EXAMPLES.user.password.value, description: EXAMPLES.user.password.desc })
    password: string;
}