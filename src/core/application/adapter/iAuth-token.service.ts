export interface IAuthTokenService {
    generateAccessToken(userId: string, email: string): string;
}