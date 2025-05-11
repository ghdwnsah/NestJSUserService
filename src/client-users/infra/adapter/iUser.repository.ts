import { CreateUserDbModel } from "@/core/domain/db/create-user-db.model";
import { Prisma, User } from "@prisma/client";

export interface iUserRepositoryForClientUsers {
    createUserWithTransaction(tx: Prisma.TransactionClient, userDto: CreateUserDbModel): Promise<User>
    createUser(userDbDto: CreateUserDbModel): Promise<User>
}