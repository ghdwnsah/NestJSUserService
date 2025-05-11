import { CreateUserDbModel } from "@/core/domain/db/create-user-db.model";
import { Client, Prisma, User } from "@prisma/client";

export interface iClientRepositoryForClientUsers {
    findByClientCode(clientCode: string): Promise<Client | null>
}