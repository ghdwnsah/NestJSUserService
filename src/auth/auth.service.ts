import * as jwt from 'jsonwebtoken';
import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { privateDecrypt } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import authConfig from 'src/config/authConfig';
import { UserInfo } from 'src/users/userInfo';
import { PrismaService } from 'src/prisma/prisma.service';

import { v4 as uuidv4 } from 'uuid';
import { addMinutes } from 'date-fns';

@Injectable()
export class AuthService {
    constructor(
        @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
        private readonly jwtService: JwtService,
        private readonly prismaService: PrismaService
    ) {}

    login(user: UserInfo, ip: string) {
        return this.generateTokens(user, ip);
    }

    verify(jwtString: string) {
        try {
            const payload = this.jwtService.verify(jwtString);
            const {id, name, email} = payload;
            return {
                id,
                name,
                email
            }
        } catch (e) {
            throw new UnauthorizedException();
        }
    }

    async generateTokens(user: UserInfo, ip: string) {
        const payload = { ...user };
        const accessToken = this.jwtService.sign(payload);
    
        const refreshToken = uuidv4();
        const expiresAt = addMinutes(new Date(), 60 * 24 * 14); // 14일
    
        await this.prismaService.refreshToken.create({
          data: {
            token: refreshToken,
            userId: user.id,
            expiresAt,
            ip,
          },
        });
    
        return { accessToken, refreshToken };
      }
    
      async refreshTokens(refreshToken: string, ip: string) {
        const tokenRecord = await this.prismaService.refreshToken.findUnique({ where: { token: refreshToken } });
    
        if (!tokenRecord || !tokenRecord.isValid) {
          throw new ForbiddenException('Invalid refresh token');
        }
    
        if (tokenRecord.expiresAt < new Date()) {
          await this.invalidateUserTokens(tokenRecord.userId);
          throw new ForbiddenException('Refresh token expired');
        }
    
        if (tokenRecord.ip !== ip) {
          await this.handleTokenTheft(tokenRecord.userId, ip);
          throw new ForbiddenException('Token theft suspected');
        }
    
        await this.prismaService.refreshToken.update({
          where: { token: refreshToken },
          data: { isValid: false },
        });
    
        const user = await this.prismaService.user.findUnique({ where: { id: tokenRecord.userId } });
        return this.generateTokens(user, ip);
      }
    
      async revokeRefreshToken(refreshToken: string) {
        await this.prismaService.refreshToken.updateMany({
          where: { token: refreshToken },
          data: { isValid: false },
        });
      }
    
      async invalidateUserTokens(userId: string) {
        await this.prismaService.refreshToken.updateMany({
          where: { userId, isValid: true },
          data: { isValid: false },
        });
      }
    
      async handleTokenTheft(userId: string, suspiciousIp: string) {
        await this.invalidateUserTokens(userId);
    
        console.warn(`[SECURITY] Refresh token theft suspected from IP: ${suspiciousIp}`);
    
        // Example: Add IP to denylist table
        await this.prismaService.ipDenylist.upsert({
          where: { ip: suspiciousIp },
          update: {},
          create: { ip: suspiciousIp, reason: 'Token theft suspected' },
        });
    
        // Example: Send Slack or Email alert (stub)
        this.notifySecurityTeam(userId, suspiciousIp);
      }

      async notifySecurityTeam(userId: string, ip: string) {
        console.log(`[ALERT] Notifying security team about possible breach by user ${userId} from IP ${ip}`);
    
        // TODO: Replace with email or Slack API integration
        // emailService.sendAlert(userId, ip);
        // slackService.sendMessage(`#security`, `🚨 Token theft from IP ${ip} for user ${userId}`);
      }
}
