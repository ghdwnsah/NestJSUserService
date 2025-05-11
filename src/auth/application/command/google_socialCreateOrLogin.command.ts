import { ICommand } from "@nestjs/cqrs";

export class GoogleSocialCreateOrLoginCommand implements ICommand {
    constructor(
        readonly email: string,
        readonly name: string,
        
        readonly accessToken: string,
        
        readonly ip: string,
        readonly role: string,
        readonly clientCode: string,
    ) {}
}