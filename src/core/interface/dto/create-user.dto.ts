import { IsNotEmpty } from "class-validator";
import { EmailField, NameField, PasswordField } from "../fields/base-user-fields";

export class CreateUserDto {
    //----------------------------
    @IsNotEmpty({ message: '이름은 필수입니다.' })
    readonly name: NameField['name'];
    //----------------------------
    @IsNotEmpty({ message: '이메일은 필수입니다.' })
    readonly email: EmailField['email'];
    //----------------------------
    @IsNotEmpty({ message: '패스워드는 필수입니다.' })
    readonly password: PasswordField['password'];
}
