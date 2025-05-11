import { GetClientUserInfoQueryResponse } from "@/client-admins/interface/response/get-clientUserInfoQuery.response";
import { CreateSocialUserDbModel } from "@/core/domain/db/create-socialUser-db.model";
import { UserWithClient } from "@/core/interface/types/userAndClient";
import { Client, User } from "@prisma/client";

export interface IUserRepositoryForAuth {
    createSocialUser(userDbDto: CreateSocialUserDbModel): Promise<User>
    updateUserVerifiedTrue(email: string): Promise<User>
    findUserBySignupVerifyToken(signupVerifyToken: string): Promise<User>
    findUserByEmail(email: string): Promise<UserWithClient>
    findResetPasswordValidToken(token: string): Promise<User>
    getUserByIdForClientAdmin(id: string): Promise<GetClientUserInfoQueryResponse | void>
    getUserByEmailForClientAdmin(email: string): Promise<GetClientUserInfoQueryResponse>
    updateUser(id: string, data: any): Promise<User>
    updatePassword(id: string, password: string): Promise<User>
    findUserById(id: string): Promise<User>
    setTwoFactorSecret(id: string, twoFactorSecret: string): Promise<User>
    setIsTwoFactorAuth(id: string, value: boolean): Promise<User>
    registerTrustedDevice(device: {
        userId: string;
        deviceToken: string;
        deviceName: string;
        ipAddress: string;
        userAgent: string;
        expiresAt: Date;
    }): Promise<void>;
}