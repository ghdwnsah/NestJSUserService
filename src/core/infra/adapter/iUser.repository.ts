import { CreateUserDbDto } from "@/core/interface/dto/create-user-db.dto";
import { User } from "@prisma/client";

export interface IUserRepoForCore {
    createUser(userDbDto: CreateUserDbDto): Promise<User>
    findUserByEmail(email: string): Promise<User>
    findUserById(id: string): Promise<any>
}