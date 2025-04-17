import { User } from "@prisma/client";

export interface IUserRepositoryForEmail {
    updateUserVerifiedTrue(email: string): Promise<User>
    findUserBySignupVerifyToken(signupVerifyToken: string): Promise<User>
  }