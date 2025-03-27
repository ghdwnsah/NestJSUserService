import { Transform } from "class-transformer";
import { Matches } from "class-validator";
import { NotIn } from "src/users/validators/not-in";
import { NotInclude } from "../validators/not-include";
import { EmailField, NameField, PasswordField } from "./base-user-fields";

export class CreateUserDto {
    @Transform(({ value }) =>
        typeof value === 'string'
          ? value.normalize('NFKC').replace(/[\s\u200B-\u200D\uFEFF\u00A0]/g, '')   // 유니코드 정규화, 공백 처리
          : value
    )
    @NotIn('password', {message: 'password는 name과 같은 문자열을 포함할 수 없습니다.'})
    readonly name: NameField['name'];

    readonly email: EmailField['email'];

    @Matches(/^[A-Za-z\d!@#$%^&*()]{8,30}$/, {
        message: '비밀번호는 8~30자이며 영문자, 숫자, 특수문자만 포함할 수 있습니다.'
    })
    @NotInclude(['123456', 'password', 'qwerty'], { message: '너무 쉬운 비밀번호입니다.' })
    readonly password: PasswordField['password'];
}
