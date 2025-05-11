import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateClientAdminUserCommand } from './create-clientadmin.command';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '@/core/interface/dto/create-user.dto';
import { CreateClientDto } from '@/core/interface/dto/create-client.dto';
import { CreateUserDbModel } from '@/core/domain/db/create-user-db.model';

import { ulid } from 'ulid';
import { hashPassword } from '@/core/common/utils/hashPassword';
import { signupVerifyTokenCreate } from '@/core/common/utils/signupVerifyToken';
import { Role } from '@/core/common/roles/role.enum';
import { CreateClientDbDto } from '@/core/interface/dto/create-client-db.dto';
import { NodemailerEmailService } from '@/email/infra/nodemailer-email.service';
import { ClientAdminsRepository } from '@/client-admins/infra/db/client-admins.repository';
import { UserCreatedEvent } from '@/core/domain/userCreate-event';


@Injectable()
@CommandHandler(CreateClientAdminUserCommand)
export class CreateClientAdminUserHandler implements ICommandHandler<CreateClientAdminUserCommand> {
    constructor (
        private readonly clientAdminsRepository: ClientAdminsRepository,
        private readonly nodemailerEmailService: NodemailerEmailService,
        private readonly eventBus: EventBus,
    ) {}

	async execute(command: CreateClientAdminUserCommand) {
		const { name, email, password, clientName } = command;

        const createUserDto: CreateUserDto = {
            name,
            email,
            password,
        };
        const createClientDto: CreateClientDto = {
            name: clientName,
        };

        const createUserDbDto: CreateUserDbModel = {
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
    
        // this.sendMemberJoinEmail(createUserDbDto.email, createUserDbDto.signupVerifyToken);
        return await this.clientAdminsRepository.createClientAdminUser(createUserDbDto, createClientDbDto);
	}

    private generateClientCode(): string {
        return `CL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    }
}