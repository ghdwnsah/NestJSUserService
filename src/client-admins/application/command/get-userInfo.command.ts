import { ICommand } from "@nestjs/cqrs";

export class GetUserInfoCommand implements ICommand {
    constructor(
        readonly id?: string,
        readonly email?: string,
    ) {}
}