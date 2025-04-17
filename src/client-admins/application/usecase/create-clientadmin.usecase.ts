import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from '@/core/interface/dto/create-user.dto';
import { ulid } from 'ulid';
import { CreateClientDbDto } from '@/client-admins/interface/dto/create-client-db.dto';
import { CreateUserDbDto } from '@/core/interface/dto/create-user-db.dto';
import { hashPassword } from '@/core/common/validators/password.validator';
import { signupVerifyTokenCreate } from '@/core/common/validators/signupVerifyToken.validator';
import { Role } from '@/core/common/roles/role.enum';

import { CreateClientAdminUserResponse } from '@/client-admins/interface/reponse/createClientAdminUser.response';
import { NodemailerEmailService } from '@/email/infra/nodemailer-email.service';
import { ClientAdminsRepository } from '@/client-admins/infra/db/client-admins.repository';
import { CreateClientDto } from '@/core/interface/dto/create-client.dto';

@Injectable()
export class CreateClientAdminUseCase {
  constructor(
    private readonly clientAdminsRepository: ClientAdminsRepository,
    private readonly nodemailerEmailService: NodemailerEmailService,
    // private readonly clientAdminsRepository: IClientAdminsRepoForClientAdmins,
    // private readonly emailService: IEmailForClientAdmins,
  ) {}

  async execute(createUserDto: CreateUserDto, createClientDto: CreateClientDto): Promise<CreateClientAdminUserResponse> {
    const createUserDbDto: CreateUserDbDto = {
      id: ulid(),
      name: createUserDto.name,
      email: createUserDto.email,
      password: await hashPassword(createUserDto.password),
      signupVerifyToken: await signupVerifyTokenCreate(),
      role: Role.ClientAdmin,
      verified: false,
    }
    const createClientDbDto: CreateClientDbDto = {
      name: createClientDto.name,
      isPaid: false,
      clientCode: this.generateClientCode(),
    }

    this.sendMemberJoinEmail(createUserDbDto.email, createUserDbDto.signupVerifyToken);
    return await this.clientAdminsRepository.createClientAdminUser(createUserDbDto, createClientDbDto);
  }

  private generateClientCode(): string {
    return `CL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  }

  private async sendMemberJoinEmail(email: string, signupVerifyToken: string){
    await this.nodemailerEmailService.sendMemberJoinVerification(email, signupVerifyToken);
  }
}
