import { CreateUserDbDto } from "@/core/interface/dto/create-user-db.dto";
import { Prisma, User } from "@prisma/client";

export interface iUserRepositoryForClientAdmins {
    createUserWithTransaction(tx: Prisma.TransactionClient, userDto: CreateUserDbDto): Promise<User>
    getUserById(id: string): Promise<User>
    getUserByEmail(email: string): Promise<User>
}