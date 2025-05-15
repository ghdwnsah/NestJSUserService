import { Inject, Injectable } from "@nestjs/common";
import { CreateClientUserCommand } from "./create-clientUser.command";
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserDbModel } from "@/core/domain/db/create-user-db.model";


import { hashPassword } from "@/core/common/utils/hashPassword";
import { signupVerifyTokenCreate } from "@/core/common/utils/signupVerifyToken";
import { Role } from "@/core/common/roles/role.enum";
import { createUserId } from "@/core/common/utils/userId";
import { iClientRepositoryForClientUsers } from "@/client-users/infra/adapter/iClient.repository";
import { iUserRepositoryForClientUsers } from "@/client-users/infra/adapter/iUser.repository";
import { UserCreatedEvent } from "@/core/domain/userCreate-event";
import { encryptClientCode } from "@/core/common/utils/crypto";
import { TenantUserRepository } from "@/core/infra/db/repo/tenant-user.repository";

@Injectable()
@CommandHandler(CreateClientUserCommand)
export class CreateClientUserHandler implements ICommandHandler<CreateClientUserCommand> {
    constructor(
        @Inject('ClientRepository') private readonly clientRepository: iClientRepositoryForClientUsers,
        private readonly tenantUserRepository: TenantUserRepository,
        
        private readonly eventBus: EventBus,
    ) {}
    async execute(command: CreateClientUserCommand) {
        const { name, email, password, clientCode } = command;

        const client = await this.clientRepository.findByClientCode(clientCode)
        if (!client) { 
            throw new Error("Client not found");
        }
        if (client.isPaid === false) {
            throw new Error("Client is not paid");
        }

        const createUserDbModel: CreateUserDbModel = {
            id: createUserId(),
            name,
            email,
            password: await hashPassword(password),
            signupVerifyToken: await signupVerifyTokenCreate(),
            role: Role.ClientUser,
            verified: false,
            clientId: client.id,
            createdAt: new Date(),
        }

        const encryptedClientCode = encryptClientCode(clientCode);
        this.eventBus.publish(new UserCreatedEvent(createUserDbModel.email, encryptedClientCode, createUserDbModel.signupVerifyToken));
        const user = await this.tenantUserRepository.createUser(clientCode, createUserDbModel);
        if (!user) {
            throw new Error("User creation failed");
        }        
    }
}