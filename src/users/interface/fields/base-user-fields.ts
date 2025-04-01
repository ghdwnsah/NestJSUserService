import { IsString, MinLength, MaxLength, IsEmail, Matches } from 'class-validator';

/**
 * 유저 관련 DTO들에서 공통적으로 사용되는 필드 모음
 */
export class NameField {
  @IsString()
  @MinLength(2)
  @MaxLength(30)
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
  @Matches(/^[A-Za-z\d!@#$%^&*()]{8,30}$/)
  password: string;
}