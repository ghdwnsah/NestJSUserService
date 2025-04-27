import { RefreshToken } from "@prisma/client"

export interface IRefreshTokenRepositoryForAuth {
    updateInvalidatePreviousRefreshTokens(userId: string): Promise<void>
    createRefreshToken(token: string, userId: string, expiresAt: Date, ip: string): Promise<void>
    findValidRefreshToken(refreshToken: string): Promise<RefreshToken>
}