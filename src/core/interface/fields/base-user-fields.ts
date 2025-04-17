import { NotIn } from '@/core/common/validators/not-in.decorator';
import { NotInclude } from '@/core/common/validators/not-include.decorator';
import { Transform } from 'class-transformer';
import { IsString, MinLength, MaxLength, IsEmail, Matches } from 'class-validator';

/**
 * 유저 관련 DTO들에서 공통적으로 사용되는 필드 모음
 */
export class NameField {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @Transform(({ value }) =>
          typeof value === 'string'
            ? value.normalize('NFKC').replace(/[\s\u200B-\u200D\uFEFF\u00A0]/g, '')   // 유니코드 정규화, 공백 처리
            : value
      )
  @NotIn('password', {message: '패스워드는 이름과 같은 문자열을 포함할 수 없습니다.'})
  name: string;
}

export class EmailField {
  @IsEmail()
  @IsString()
  @MaxLength(60)
  email: string;
}

export class PasswordField {
  @IsString()
  @Matches(/^[A-Za-z\d!@#$%^&*()]{8,30}$/, {
    message: '비밀번호는 8~30자이며 영문자, 숫자, 특수문자만 포함할 수 있습니다.'
  })
  @NotInclude(['123456', 'password', 'qwerty'], { message: '너무 쉬운 비밀번호입니다.' })
  password: string;
}