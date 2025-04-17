import { ICommand } from '@nestjs/cqrs';

export class CreateClientAdminCommand implements ICommand {
    constructor(
        readonly name: string,
        readonly email: string,
        readonly password: string,
        readonly clientName: string,
    ) { }
}