import { iUserRepositoryForClientUsers } from "@/client-users/infra/adapter/iUser.repository";
import { CreateClientUserResponse } from "@/client-users/interface/response/createClientUser.response";
import { CreateUserDbModel } from "@/core/domain/db/create-user-db.model";
import { PrismaService } from "@/core/infra/db/prisma.service";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class ClientUsersRepository {
    constructor(
        private readonly prismaService: PrismaService,
        @Inject('UserRepository') private readonly userRepository: iUserRepositoryForClientUsers,
    ) {}

    async createClientUser(createUserDbModel: CreateUserDbModel): Promise<CreateClientUserResponse> {
        return await this.prismaService.$transaction(async (tx) => {
            // 1. 클라이언트 조회
            const client = await tx.client.findUnique({ where: { id: createUserDbModel.id } });
            if (!client) {
                throw new Error("Client not found");
            }
      
            // 2. 클라이언트 유저 생성
            const user = await this.userRepository.createUserWithTransaction(tx, {
              ...createUserDbModel,
                clientId: client.id
            })
      
            return {
              id: user.id
            };
          });
    }
}