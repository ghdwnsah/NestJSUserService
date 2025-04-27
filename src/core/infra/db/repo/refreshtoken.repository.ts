import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { IRefreshTokenRepositoryForAuth } from "@/auth/infra/adaper/iRefreshToken.repository";
import { RefreshToken } from "@prisma/client";

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

      async findValidRefreshToken(refreshToken: string): Promise<RefreshToken> {
        return this.prismaService.refreshToken.findFirst({
          where: {
            token: refreshToken,
            isValid: true,
            expiresAt: {
              gt: new Date(), // 현재 시간보다 만료시간이 더 큰 (아직 안 만료된)
            },
          },
        });
      }
    
}