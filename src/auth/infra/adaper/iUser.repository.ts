import { User } from "@prisma/client";

export interface IUserRepositoryForAuth {
    updateUserVerifiedTrue(email: string): Promise<User>
    findUserBySignupVerifyToken(signupVerifyToken: string): Promise<User>
    findUserByEmail(email: string): Promise<User>
    findResetPasswordValidToken(token: string): Promise<User>
    updatePassword(id: string, password: string): Promise<User>
}