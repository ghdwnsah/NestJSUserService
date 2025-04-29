import * as jwt from 'jsonwebtoken';
import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { privateDecrypt } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import authConfig from '@/core/common/config/authConfig';
import { UserInfo } from '@/core/interface/userInfo';
import { PrismaService } from '@/core/infra/db/prisma.service';

import { v4 as uuidv4 } from 'uuid';
import { addMinutes } from 'date-fns';
import { LoginResponse } from '@/email/interface/response/login.response';
import { CustomCacheService } from '@/shared/cache/cache.service';
import { TokenCachePayload } from '@/core/interface/cache/token.interface';
import { SlackService } from '@/shared/slack/slack.service';
import { NodemailerEmailService } from '@/email/infra/nodemailer-email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly cacheService: CustomCacheService,
    private readonly slackService: SlackService,
    private readonly emailService: NodemailerEmailService,
  ) {}

  async login(user: UserInfo, ip: string): Promise<LoginResponse> {
    await this.invalidatePreviousRefreshTokens(user.id);
    await this.setUserAccessTokenBlacklistCache(user.id);
    await this.clearUserTokenCache(user.id);
    this.slackService.sendMessage(
      `User ${user.id} login from IP ${ip}`);
    return this.generateTokens(user, ip);
  }

  async verify(jwtString: string, ip: string) {
    const payload = this.jwtService.verify(jwtString);
    const { id, name, email } = payload;

    try {
      const isBlacklisted = await this.cacheService.getIsAccessTokenBlacklistCache(id, jwtString);
      if (isBlacklisted) {
        console.warn('Access token is blacklisted');
        throw new UnauthorizedException('Access token has been revoked');
      }

      const cachedPayload = await this.cacheService.getAccessTokenCache(id, jwtString);
      if (cachedPayload) {
        console.log('Token loaded from cache');
        return cachedPayload;
      }      

      // 없으면 캐시에 저장
      const cachePayload: TokenCachePayload = {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        clientId: payload.clientId,
        ip,
        issuedAt: Date.now(),
      }
      await this.cacheService.setUserAccessTokenCache(payload.id, jwtString, cachePayload);

      return {
        id,
        name,
        email,
      };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async invalidatePreviousRefreshTokens(userId: string) {
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

  async setUserAccessTokenBlacklistCache(userId: string) {
    await this.cacheService.setUserAccessTokenBlacklistCache(userId);
  }

  async clearUserTokenCache(userId: string) {
    await this.cacheService.clearUserAllTokenCaches(userId);
  }

  async generateTokens(user: UserInfo, ip: string) {
    console.log('payload user : ', user);
    const payload = { ...user };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = uuidv4();
    const expiresAt = addMinutes(new Date(), 60 * 24 * 14); // 14일

    const cachePayload: TokenCachePayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      clientId: user.clientId,
      ip,
      issuedAt: Date.now(),
    } 

    await this.prismaService.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
        ip,
      },
    });

    await this.cacheService.setUserAllTokenCache(user.id, accessToken, refreshToken, cachePayload)
    console.log('===TOKEN 저장 시===');
    console.log(`[[${accessToken}]]`, accessToken.length);

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string, ip: string) {
    const tokenRecord = await this.prismaService.refreshToken.findUnique({
      where: { token: refreshToken },
    });

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

    const user = await this.prismaService.user.findUnique({
      where: { id: tokenRecord.userId },
    });
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
  
    await this.prismaService.ipDenylist.upsert({
      where: { ip: suspiciousIp },
      update: {},
      create: { ip: suspiciousIp, reason: 'Token theft suspected' },
    });
    
    await this.notifySecurityTeam(userId, suspiciousIp);
  }

  async notifySecurityTeam(userId: string, ip: string) {
    console.log(
      `[ALERT] Notifying security team about possible breach by user ${userId} from IP ${ip}`,
    );

    // 1. Slack 알림
    await this.slackService.sendMessage(
      `🚨 [SECURITY] Suspicious IP access detected.\nUser ID: ${userId}\nIP: ${ip}`
    );
  
    // 2. Email 알림
    const user = await this.prismaService.user.findUnique({ where: { id: userId } });
  
    if (user) {
      await this.emailService.sendSecurityAlertEmail(user.email, user.name, ip);
    }
  }
}
