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

import * as geoip from 'geoip-lite';
import { TenantUserRepository } from '@/core/infra/db/repo/tenant-user.repository';
import { TenantRefreshTokenRepository } from '@/core/infra/db/repo/tenant-refreshtoken.repository';
import { TenantTrustedDeviceRepository } from '@/core/infra/db/repo/tenant-trustedDevice.repository';
import { TenantIpDenylistRepository } from '@/core/infra/db/repo/tenant-ipDenyList.repository';
import { cli } from 'winston/lib/winston/config';

@Injectable()
export class AuthService {
  private rootLoginClientCacheValue = 'root';

  constructor(
    private readonly jwtService: JwtService,
    private readonly rootPrismaService: PrismaService,
    private readonly cacheService: CustomCacheService,
    private readonly slackService: SlackService,
    private readonly emailService: NodemailerEmailService,
    private readonly tenantUserRepository: TenantUserRepository,
    private readonly tenantRefreshRepository: TenantRefreshTokenRepository,
    private readonly tenantTrustedDeviceRepository: TenantTrustedDeviceRepository,
    private readonly tenantIpDenylistRepository: TenantIpDenylistRepository,
  ) {
  }

  

  async login(user: UserInfo, ip: string, deviceToken?: string, userAgent?: string): Promise<LoginResponse> {
    await this.invalidatePreviousRefreshTokens(user.id);
    await this.setUserAccessTokenBlacklistCache(user.id);
    await this.clearUserTokenCache(user.id);
    this.slackService.sendMessage(
      `User ${user.id} login from IP ${ip}`);

    if (user.isTwoFactorEnabled && !deviceToken) {
      throw new UnauthorizedException('2FA is enabled, but no device token provided, please OTP verfify and register your device first.');
    }

    let trustedDeviceToken = deviceToken;
    if (user.isTwoFactorEnabled) {
      trustedDeviceToken = await this.validateOrRegisterDevice(user.id, deviceToken, ip, userAgent);
    }

    return this.generateTokens(user, ip);
  }

  async tenantLogin(clientCode: string, user: UserInfo, ip: string, deviceToken?: string, userAgent?: string): Promise<LoginResponse> {
    await this.tenantInvalidatePreviousRefreshTokens(clientCode, user.id);
    await this.setTenantUserAccessTokenBlacklistCache(clientCode, user.id);
    await this.clearTenantUserTokenCache(clientCode, user.id);
    this.slackService.sendMessage(
      `Tenant Client ${clientCode} User ${user.id} login from IP ${ip}`);

    if (user.isTwoFactorEnabled && !deviceToken) {
      throw new UnauthorizedException('2FA is enabled, but no device token provided, please OTP verfify and register your device first.');
    }

    let trustedDeviceToken = deviceToken;
    if (user.isTwoFactorEnabled) {
      trustedDeviceToken = await this.tenantValidateOrRegisterDevice(user.id, deviceToken, ip, userAgent);
    }

    return this.tenantGenerateTokens(clientCode, user, ip);
  }

  async verify(jwtString: string, ip: string) {
    const payload = this.jwtService.verify(jwtString);
    const { id, name, email } = payload;

    try {
      const isBlacklisted = await this.cacheService.getIsAccessTokenBlacklistCache(this.rootLoginClientCacheValue, id, jwtString);
      if (isBlacklisted) {
        console.warn('Access token is blacklisted');
        throw new UnauthorizedException('Access token has been revoked');
      }

      const cachedPayload = await this.cacheService.getAccessTokenCache(this.rootLoginClientCacheValue, id, jwtString);
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
        isTwoFactorEnabled: payload.isTwoFactorEnabled,
        ip,
        issuedAt: Date.now(),
      }
      await this.cacheService.setUserAccessTokenCache(this.rootLoginClientCacheValue, payload.id, jwtString, cachePayload);

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
    await this.rootPrismaService.refreshToken.updateMany({
      where: {
        userId,
        isValid: true,
      },
      data: {
        isValid: false,
      },
    });
  }

  async tenantInvalidatePreviousRefreshTokens(clientCode:string, userId: string) {
    await this.tenantRefreshRepository.invalidatePreviousRefreshTokens(clientCode, userId);
  }


  async setUserAccessTokenBlacklistCache(userId: string) {
    await this.cacheService.setUserAccessTokenBlacklistCache(this.rootLoginClientCacheValue, userId);
  }

  async setTenantUserAccessTokenBlacklistCache(clientCode: string, userId: string) {
    await this.cacheService.setUserAccessTokenBlacklistCache(clientCode, userId);
  }

  async clearUserTokenCache(userId: string) {
    await this.cacheService.clearUserAllTokenCaches(this.rootLoginClientCacheValue, userId);
  }

  async clearTenantUserTokenCache(clientCode:string, userId: string) {
    await this.cacheService.clearUserAllTokenCaches(clientCode, userId);
  }

  async generateTokens(user: UserInfo, ip: string, deviceToken?: string): Promise<LoginResponse> {
    console.log('payload user : ', user);
    const payload = { ...user };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4();
    const expiresAt = addMinutes(new Date(), 60 * 24 * 14); // 14일

    const cachePayload: TokenCachePayload = {
      ...user,
      ip,
      issuedAt: Date.now(),
    } 

    await this.rootPrismaService.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
        ip,
      },
    });

    await this.cacheService.setUserAllTokenCache(this.rootLoginClientCacheValue, user.id, accessToken, refreshToken, cachePayload, deviceToken)
    console.log('===TOKEN 저장 시===');
    console.log(`[[${accessToken}]]`, accessToken.length);

    return { 
      accessToken, 
      refreshToken,
      ...(deviceToken && { deviceToken }),
    };
  }

  async tenantGenerateTokens(clientCode: string, user: UserInfo, ip: string, deviceToken?: string): Promise<LoginResponse> {
    console.log('payload user : ', user);
    const payload = { ...user };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4();
    const expiresAt = addMinutes(new Date(), 60 * 24 * 14); // 14일

    const cachePayload: TokenCachePayload = {
      ...user,
      ip,
      issuedAt: Date.now(),
    } 

    await this.tenantRefreshRepository.createRefreshToken(clientCode, user.id, refreshToken, expiresAt, ip);

    await this.cacheService.setUserAllTokenCache(clientCode, user.id, accessToken, refreshToken, cachePayload, deviceToken)
    console.log('===TOKEN 저장 시===');
    console.log(`[[${accessToken}]]`, accessToken.length);

    return {
      accessToken, 
      refreshToken,
      ...(deviceToken && { deviceToken }),
    };
  }

  async validateOrRegisterDevice(
    userId: string,
    deviceToken: string | undefined,
    ip: string,
    userAgent?: string,
  ): Promise<string> {
    const now = new Date();
    const deviceLifespanMinutes = 60 * 24 * 30; // 30일
  
    // 1. 기존 등록된 deviceToken이 유효한가?
    if (deviceToken) {
      const deviceInfo = await this.rootPrismaService.trustedDevice.findUnique({
        where: { deviceToken },
      });

      if (deviceInfo.ipAddress !== ip) {
        // 의심 로그인 감지: 등록된 디바이스지만 IP 변경
        const geo = geoip.lookup(ip);
        const locationText = geo ? `${geo.city || ''}, ${geo.country || 'Unknown'}` : 'Unknown';
        await this.handleTokenTheft(userId, ip, locationText);
        throw new UnauthorizedException('의심스러운 로그인 감지됨');
      }
  
      if (deviceInfo && deviceInfo.userId === userId && deviceInfo.expiresAt > now) {
        return deviceToken; // 유효한 토큰 → 그대로 사용
      }
    }
  
    // 2. 새로운 deviceToken 생성
    const newToken = uuidv4();
    await this.rootPrismaService.trustedDevice.create({
      data: {
        userId,
        deviceToken: newToken,
        ipAddress: ip,
        userAgent,
        expiresAt: addMinutes(now, deviceLifespanMinutes),
      },
    });
  
    return newToken;
  }

  async tenantValidateOrRegisterDevice(
    clientCode: string,
    userId: string,
    deviceToken: string | undefined,
    ip: string,
    userAgent?: string,
  ): Promise<string> {
    const now = new Date();
    const deviceLifespanMinutes = 60 * 24 * 30; // 30일
  
    // 1. 기존 등록된 deviceToken이 유효한가?
    if (deviceToken) {
      const tenantDeviceInfo = await this.tenantTrustedDeviceRepository.findDeviceToken(clientCode, deviceToken);

      if (tenantDeviceInfo.ipAddress !== ip) {
        // 의심 로그인 감지: 등록된 디바이스지만 IP 변경
        const geo = geoip.lookup(ip);
        const locationText = geo ? `${geo.city || ''}, ${geo.country || 'Unknown'}` : 'Unknown';
        await this.tenantHandleTokenTheft(clientCode, userId, ip, locationText);
        throw new UnauthorizedException('의심스러운 로그인 감지됨');
      }
  
      if (tenantDeviceInfo && tenantDeviceInfo.userId === userId && tenantDeviceInfo.expiresAt > now) {
        return deviceToken; // 유효한 토큰 → 그대로 사용
      }
    }
  
    // 2. 새로운 deviceToken 생성
    const newToken = uuidv4();
    await this.tenantTrustedDeviceRepository.createTrustedDevice(clientCode, userId, newToken, ip, userAgent, addMinutes(now, deviceLifespanMinutes));  
  
    return newToken;
  }

  async refreshTokens(refreshToken: string, ip: string) {
    const tokenRecord = await this.rootPrismaService.refreshToken.findUnique({
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

    await this.rootPrismaService.refreshToken.update({
      where: { token: refreshToken },
      data: { isValid: false },
    });

    const user = await this.rootPrismaService.user.findUnique({
      where: { id: tokenRecord.userId },
    });
    return this.generateTokens(user, ip);
  }

  async revokeRefreshToken(refreshToken: string) {
    await this.rootPrismaService.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isValid: false },
    });
  }

  async invalidateUserTokens(userId: string) {
    await this.rootPrismaService.refreshToken.updateMany({
      where: { userId, isValid: true },
      data: { isValid: false },
    });
  }

  async tenantInvalidateUserTokens(clientCode: string, userId: string) {
    await this.tenantRefreshRepository.invalidatePreviousRefreshTokens(clientCode, userId);
  }

  async handleTokenTheft(userId: string, suspiciousIp: string, locationText?: string) {
    await this.invalidateUserTokens(userId);
  
    console.warn(`[SECURITY] Refresh token theft suspected from IP: ${suspiciousIp}`);
  
    await this.rootPrismaService.ipDenylist.upsert({
      where: { ip: suspiciousIp },
      update: {},
      create: { ip: suspiciousIp, reason: 'Token theft suspected' },
    });
    
    await this.notifySecurityTeam(userId, suspiciousIp, locationText);
  }

  async tenantHandleTokenTheft(clientCode: string, userId: string, suspiciousIp: string, locationText?: string) {
    await this.tenantInvalidateUserTokens(clientCode, userId);
  
    console.warn(`[SECURITY] Refresh token theft suspected from IP: ${suspiciousIp}`);
  
    await this.tenantIpDenylistRepository.ipUpsert(clientCode, suspiciousIp);
    await this.notifySecurityTeam(userId, suspiciousIp, locationText);
  }

  async notifySecurityTeam(clientCode: string, userId: string, ip: string, locationText?: string) {
    console.log(
      `[ALERT] Notifying security team about possible breach by client ${clientCode} user ${userId} from IP ${ip}`,
    );

    // 1. Slack 알림
    await this.slackService.sendMessage(
      `🚨 [SECURITY] Suspicious IP access detected. \nClient Code: ${clientCode} \nUser ID: ${userId}\nIP: ${ip}`
    );
  
    // 2. Email 알림
    const user = await this.rootPrismaService.user.findUnique({ where: { id: userId } });

     // 2-1. resetPasswordToken 생성
    const resetToken = uuidv4();
    const expireMinutes = 30; // 30분 유효
    const expiresAt = addMinutes(new Date(), expireMinutes); 

    await this.rootPrismaService.user.update({
      where: { id: userId },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: expiresAt,
      },
    });
  
    if (user) {
      await this.emailService.sendSecurityAlertEmail(user.email, user.name, ip, resetToken, expireMinutes, locationText);
    }
  }
}
