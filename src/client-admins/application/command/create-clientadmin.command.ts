import { ICommand } from '@nestjs/cqrs';

export class CreateClientAdminUserCommand implements ICommand {
    constructor(
        readonly name: string,
        readonly email: string,
        readonly password: string,
        readonly clientCode: string,
        readonly clientName: string,
    ) { }
}