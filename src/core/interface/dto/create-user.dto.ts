import { IsNotEmpty } from "class-validator";
import { EmailField, NameField, PasswordField } from "../fields/base-user-fields";
import { ApiProperty } from "@nestjs/swagger";
import { EXAMPLES } from "@/shared/swagger/example";

export class CreateUserDto {
    //----------------------------
    @ApiProperty({ example: EXAMPLES.user.name.value, description: EXAMPLES.user.name.desc })
    @IsNotEmpty({ message: '이름은 필수입니다.' })
    readonly name: NameField['name'];
    //----------------------------
    @ApiProperty({ example: EXAMPLES.user.email.value, description: EXAMPLES.user.email.desc })
    @IsNotEmpty({ message: '이메일은 필수입니다.' })
    readonly email: EmailField['email'];
    //----------------------------
    @ApiProperty({ example: EXAMPLES.user.password.value, description: EXAMPLES.user.password.desc })
    @IsNotEmpty({ message: '패스워드는 필수입니다.' })
    readonly password: PasswordField['password'];
}
