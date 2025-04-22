import { GetClientUserInfoQueryResponse } from "@/client-admins/interface/reponse/get-clientUserInfoQuery.response";
import { CreateUserDbDto } from "@/core/interface/dto/create-user-db.dto";
import { Prisma, User } from "@prisma/client";

export interface iUserRepositoryForClientAdmins {
    createUserWithTransaction(tx: Prisma.TransactionClient, userDto: CreateUserDbDto): Promise<User>
    getUserById(id: string): Promise<User>
    getUserByIdForClientAdmin(id: string): Promise<GetClientUserInfoQueryResponse | void>
    getUserByEmail(email: string): Promise<User>
    getUserByEmailForClientAdmin(email: string): Promise<GetClientUserInfoQueryResponse>
    updateUser(id: string, data: any): Promise<User>
}