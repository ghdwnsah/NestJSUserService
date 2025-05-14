import { GetClientUserInfoQueryResponse } from "@/client-admins/interface/response/get-clientUserInfoQuery.response";
import { CreateUserDbModel } from "@/core/domain/db/create-user-db.model";
import { Prisma, PrismaClient, User } from "@prisma/client";

export interface iUserRepositoryForClientAdmins {
    createUserWithTransaction(tx: Prisma.TransactionClient, userDto: CreateUserDbModel): Promise<User>
    getUserById(id: string): Promise<User>
    getUserByIdForClientAdmin(id: string): Promise<GetClientUserInfoQueryResponse | void>
    getUserByEmail(email: string): Promise<User>
    getUserByEmailForClientAdmin(email: string): Promise<GetClientUserInfoQueryResponse>
    updateUser(id: string, data: any): Promise<User>
    createClientAdminUser(userDbDto: CreateUserDbModel, tenantPrisma: PrismaClient): Promise<User>
}