import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    BadRequestException,
  } from '@nestjs/common';
  import { CreateUserDto } from '../../interface/dto/create-user.dto';
  
  @Injectable()
  export class UserValidationPipe implements PipeTransform {
    transform(value: CreateUserDto, metadata: ArgumentMetadata) {
      const { name, email } = value;
      if (email.toLowerCase().includes(name.toLowerCase())) {
        throw new BadRequestException('이름은 이메일에 포함되면 안 됩니다.');
      }
      return value;
    }
  }