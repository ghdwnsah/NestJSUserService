import { User } from "@prisma/client";

export interface IUserRepositoryForAuth {
    updateUserVerifiedTrue(email: string): Promise<User>
    findUserBySignupVerifyToken(signupVerifyToken: string): Promise<User>
}