import { ICommand } from '@nestjs/cqrs';

export class UpdateResetPasswordRequestCommand implements ICommand {
    constructor(
        readonly id?: string,
        readonly email?: string,
    ) { }
}