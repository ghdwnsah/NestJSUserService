import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateClientAdminCommand } from './create-clientadmin.command';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '@/core/interface/dto/create-user.dto';
import { CreateClientDto } from '@/client-admins/interface/dto/create-client.dto';
import { CreateUserDbDto } from '@/core/interface/dto/create-user-db.dto';

import { ulid } from 'ulid';
import { hashPassword } from '@/core/common/validators/password.validator';
import { signupVerifyTokenCreate } from '@/core/common/validators/signupVerifyToken.validator';
import { Role } from '@/core/common/roles/role.enum';
import { CreateClientDbDto } from '@/client-admins/interface/dto/create-client-db.dto';
import { NodemailerEmailService } from '@/email/infra/nodemailer-email.service';
import { ClientAdminsRepository } from '@/client-admins/infra/db/client-admins.repository';
import { UserCreatedEvent } from '@/core/domain/userCreate-event';
import { TestEvent } from '@/core/domain/test-event';

@Injectable()
@CommandHandler(CreateClientAdminCommand)
export class CreateUserHandler implements ICommandHandler<CreateClientAdminCommand> {
    constructor (
        private readonly clientAdminsRepository: ClientAdminsRepository,
        private readonly nodemailerEmailService: NodemailerEmailService,
        private readonly eventBus: EventBus,
    ) {}

	async execute(command: CreateClientAdminCommand) {
		const { name, email, password, clientName } = command;

        const createUserDto: CreateUserDto = {
            name,
            email,
            password,
        };
        const createClientDto: CreateClientDto = {
            name: clientName,
        };

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

            this.eventBus.publish(new UserCreatedEvent(createUserDbDto.email, createUserDbDto.signupVerifyToken));
	        this.eventBus.publish(new TestEvent());
		
            // this.sendMemberJoinEmail(createUserDbDto.email, createUserDbDto.signupVerifyToken);
            return await this.clientAdminsRepository.createClientAdminUser(createUserDbDto, createClientDbDto);
	}

    private generateClientCode(): string {
        return `CL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    }
    
    private async sendMemberJoinEmail(email: string, signupVerifyToken: string){
        await this.nodemailerEmailService.sendMemberJoinVerification(email, signupVerifyToken);
    }
}