import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserInfo } from '@/core/interface/userInfo';
import { GetUserInfoQuery } from './get-user-info.query';
import { UserRepository } from '@/core/infra/db/repo/user.repository.impl';

@QueryHandler(GetUserInfoQuery)
export class GetUserInfoQueryHandler implements IQueryHandler<GetUserInfoQuery> {
    constructor(
        private readonly userRepository: UserRepository,
    ) { }

    async execute(query: GetUserInfoQuery): Promise<UserInfo> {
        const { userId, clientId } = query;

        const user = await this.userRepository.findOneForClientAdmin( userId, clientId );
        if (!user) {
            throw new NotFoundException('User does not exist');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,  
        };
    }
}