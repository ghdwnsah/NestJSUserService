import { ICommand } from "@nestjs/cqrs";

export class VerifyUserEmailCommand implements ICommand {
    constructor (
        readonly encryptedClientCode: string,
        readonly signupVerifyToken: string,
        readonly ip: string,
    ) {} 
}