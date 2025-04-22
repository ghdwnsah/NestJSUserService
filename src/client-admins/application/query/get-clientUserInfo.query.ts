import { IQuery } from "@nestjs/cqrs";

export class GetClientUserInfoQuery implements IQuery {
    constructor(
        readonly id?: string,
        readonly email?: string,
    ) {}
}