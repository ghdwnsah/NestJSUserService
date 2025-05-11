import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetClientUserInfoQuery } from "./get-clientUserInfo.query";
import { iUserRepositoryForClientAdmins } from "@/client-admins/infra/adapter/iUser.repository";
import { GetClientUserInfoQueryResponse } from "@/client-admins/interface/response/get-clientUserInfoQuery.response";

@Injectable()
@QueryHandler(GetClientUserInfoQuery)
export class GetClientUserInfoHandler implements IQueryHandler<GetClientUserInfoQuery>{
    constructor (
        @Inject('UserRepository') private readonly userRepository: iUserRepositoryForClientAdmins,
    ) {}

    async execute(query: GetClientUserInfoQuery): Promise<GetClientUserInfoQueryResponse | void> {
        const { id, email } = query;
        if (!id && !email) {
            throw new BadRequestException('id 또는 email 중 하나는 필수입니다.');
        }

        if (id) {
            const user = await this.userRepository.getUserByIdForClientAdmin(id);
            if (!user) throw new BadRequestException("유저가 존재하지 않습니다.");
            else return user;
        } else if (email) {
            const user = await this.userRepository.getUserByEmailForClientAdmin(email);
            if (!user) throw new BadRequestException("유저가 존재하지 않습니다.");
            else return user;
        }
    }
}