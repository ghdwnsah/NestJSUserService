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
// import { CustomCacheService } from '@/shared/cache/cache.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async login(user: UserInfo, ip: string): Promise<LoginResponse> {
    console.log('cacheManager.stores : ', this.cacheManager.stores);
    console.log('cacheManager store : ', this.cacheManager.stores[0].opts.store);
    await this.invalidatePreviousRefreshTokens(user.id);
    return this.generateTokens(user, ip);
  }

  async verify(jwtString: string) {
    try {
      // const cachedPayload = await this.cacheService.getAccessCache(jwtString);
      const cachedPayload = await this.cacheManager.get<any>(`access:${jwtString}`);
      if (cachedPayload) {
        console.log('Token loaded from cache');
        return cachedPayload;
      }

      const payload = this.jwtService.verify(jwtString);
      const { id, name, email } = payload;

      // 캐시에 저장
      // await this.cacheService.setAccessCache(jwtString, payload);
      await this.cacheManager.set(`access:${jwtString}`, payload, 36000 );

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

  async generateTokens(user: UserInfo, ip: string) {
    console.log('payload user : ', user);
    const payload = { ...user };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = uuidv4();
    const expiresAt = addMinutes(new Date(), 60 * 24 * 14); // 14일

    const saveCacheValue = {
      userId: user.id,
      userEmail: user.email,
      ip,
    } 

    await this.prismaService.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
        ip,
      },
    });

    // await this.cacheService.setAllCache(accessToken, refreshToken, saveCacheValue);
    await this.cacheManager.set(`access:${accessToken}`, saveCacheValue, 46000 );
    await this.cacheManager.set(`refresh:${refreshToken}`, saveCacheValue, 46000 );
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

    console.warn(
      `[SECURITY] Refresh token theft suspected from IP: ${suspiciousIp}`,
    );

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
    console.log(
      `[ALERT] Notifying security team about possible breach by user ${userId} from IP ${ip}`,
    );

    // TODO: Replace with email or Slack API integration
    // emailService.sendAlert(userId, ip);
    // slackService.sendMessage(`#security`, `🚨 Token theft from IP ${ip} for user ${userId}`);
  }
}
