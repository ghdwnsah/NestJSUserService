import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { GetUserInfoCommand } from "./get-userInfo.command";
import { UserRepository } from "@/core/infra/db/repo/user.repository.impl";
import { iUserRepositoryForClientAdmins } from "@/client-admins/infra/adapter/iUser.repository";

@Injectable()
@CommandHandler(GetUserInfoCommand)
export class GetUserInfoHandler implements ICommandHandler<GetUserInfoCommand>{
    constructor (
        @Inject('UserRepository') private readonly userRepository: iUserRepositoryForClientAdmins,
    ) {}

    async execute(command: GetUserInfoCommand): Promise<any> {
        const { id, email } = command;
        if (!id && !email) {
            throw new BadRequestException('id 또는 email 중 하나는 필수입니다.');
        }

        if (id) {
            return await this.userRepository.getUserById(id);
        } else if (email) {
            return await this.userRepository.getUserByEmail(email);
        }
    }
}