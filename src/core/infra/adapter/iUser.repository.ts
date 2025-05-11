import { CreateUserDbModel } from "@/core/domain/db/create-user-db.model";
import { User } from "@prisma/client";

export interface IUserRepoForCore {
    createUser(userDbDto: CreateUserDbModel): Promise<User>
    findUserByEmail(email: string): Promise<User>
    findUserById(id: string): Promise<any>
}