import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../infra/db/repository/user.repository';
import { checkEmailExists } from '@/core/common/validators/email.validator';
import { hashPassword } from '@/core/common/validators/password.validator';
import { signupVerifyTokenCreate } from '@/core/common/validators/signupVerifyToken.validator';
import { ulid } from 'ulid';
import { EmailService } from '@/email/email.service';
import { CreateUserDto } from '@/users/interface/dto/create-user.dto';
import { CreateUserDbDto } from '@/users/interface/dto/create-user-db.dto';
import { Role } from '@/core/common/roles/role.enum';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(userDto: CreateUserDto, role: Role) {
    console.log('execute()');
    await checkEmailExists(
      userDto.email, 
      this.userRepository,
      // this.userRepository.findUserByEmail.bind(this.userRepository),
      );
      console.log('execute2()');
    const userDbDto: CreateUserDbDto = {
      id: ulid(),
      name: userDto.name,
      email: userDto.email,
      password: await hashPassword(userDto.password),
      signupVerifyToken: await signupVerifyTokenCreate(),
      verified: false,
      role
    }
    
    this.sendMemberJoinEmail(userDbDto.email, userDbDto.signupVerifyToken);

    return await this.userRepository.createUser(userDbDto);
  }

  private async sendMemberJoinEmail(email: string, signupVerifyToken: string){
    console.log('sendMemberJoinEmail()');
    await this.emailService.sendMemberJoinVerification(email, signupVerifyToken);
  }
}