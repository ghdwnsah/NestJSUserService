import { GetClientUserInfoQueryResponse } from "@/client-admins/interface/reponse/get-clientUserInfoQuery.response";
import { User } from "@prisma/client";

export interface IUserRepositoryForAuth {
    updateUserVerifiedTrue(email: string): Promise<User>
    findUserBySignupVerifyToken(signupVerifyToken: string): Promise<User>
    findUserByEmail(email: string): Promise<User>
    findResetPasswordValidToken(token: string): Promise<User>
    getUserByIdForClientAdmin(id: string): Promise<GetClientUserInfoQueryResponse | void>
    getUserByEmailForClientAdmin(email: string): Promise<GetClientUserInfoQueryResponse>
    updateUser(id: string, data: any): Promise<User>
    updatePassword(id: string, password: string): Promise<User>
    findUserById(id: string): Promise<User>
}