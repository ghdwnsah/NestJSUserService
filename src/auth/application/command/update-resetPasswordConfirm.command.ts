import { ICommand } from "@nestjs/cqrs";

export class UpdateResetPasswordConfirmCommand implements ICommand {
    constructor (
        readonly token: string,
        readonly newPassword: string,
    ) {} 
}