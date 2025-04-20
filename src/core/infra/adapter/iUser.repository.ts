import { User } from "@prisma/client";

export interface IUserRepoForCore {
    findUserByEmail(email: string): Promise<User>
}