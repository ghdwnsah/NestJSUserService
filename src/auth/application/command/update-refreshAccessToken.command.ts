import { ICommand } from "@nestjs/cqrs";

export class UpdateRefreshAccessTokenCommand implements ICommand {
    constructor (
        readonly userId: string,
        readonly refreshToken: string,        
        readonly ip: string,
    ) {} 
}