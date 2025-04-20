import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { IRefreshTokenRepositoryForAuth } from "@/auth/infra/adaper/iRefreshToken.repository";

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepositoryForAuth {

    constructor (private readonly prismaService: PrismaService,) {}

    async updateInvalidatePreviousRefreshTokens(userId: string): Promise<void> {
        await this.prismaService.refreshToken.updateMany({
          where: {
            userId,
            isValid: true,
          },
          data: {
            isValid: false,
          },
        });
      }
    
      async createRefreshToken(token: string, userId: string, expiresAt: Date, ip: string): Promise<void> {
        await this.prismaService.refreshToken.create({
            data: {
                token,
              userId,
              expiresAt,
              ip,
            },
          });
      }
    
}