import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/core/infra/db/prisma.service';
// import { CustomCacheService } from '@/shared/cache/cache.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CustomCacheService } from '@/shared/cache/cache.service';
import { Request } from 'express';
import { TokenCachePayload } from '@/core/interface/cache/token.interface';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly cacheService: CustomCacheService,
    private reflector: Reflector,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    if (!req['token']) {
      console.warn('Token not found in request'); 
      throw new UnauthorizedException('Invalid token payload');
    }
    console.log(`JwtStrategy req['token'] : `, req['token']);
    const authHeader = req.headers['authorization']; // ex) Bearer xxx.yyy.zzz
    const accessToken = authHeader?.split(' ')[1];
    console.log('payload : ', payload);
    const userId = payload.id || payload.sub; // payload에서 id 또는 sub 가져오기
    const clientCode = req['tenantId'];

    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0] : req.ip;

    if (!accessToken) {
      throw new UnauthorizedException('No token found');
    }
    // 블랙리스트 조회
    const isBlacklisted = await this.cacheService.getIsAccessTokenBlacklistCache(clientCode, userId, accessToken);
    if (isBlacklisted) {
      console.warn('Access token is blacklisted');
      throw new UnauthorizedException('Access token has been revoked');
    }
  
    // 캐시에서 유저 정보 조회
    let userInfoCache = await this.cacheService.getAccessTokenCache(clientCode, userId, accessToken);
    if (userInfoCache) {
      console.log('User loaded from cache');
      console.log('JSON string, parse : ', JSON.parse(JSON.stringify(userInfoCache)));

      return JSON.parse(JSON.stringify(userInfoCache));
    }

    // 캐시에 없으면 DB에서 조회
    let userInfoDb = await this.prisma.user.findFirst({
      where: { id: payload.id },
      include: {
        client: true,
        refreshTokens: true,
      },
    });
    console.log('db 조회 user : ', userInfoDb);

    if (!userInfoDb) {
      throw new UnauthorizedException('User not found');
    }

    // 캐시에 저장
    const saveCacheValue: TokenCachePayload = {
      id: userInfoDb.id,
      name: userInfoDb.name,
      email: userInfoDb.email,
      clientId: userInfoDb.clientId,
      isTwoFactorEnabled: userInfoDb.isTwoFactorEnabled,
      ip,
      issuedAt: Date.now(),
    } 
    const validRefreshToken = userInfoDb.refreshTokens.find(token => token.isValid);
    if (validRefreshToken) { // 리프레시 토큰도 있다면
      await this.cacheService.setUserAllTokenCache(clientCode, userInfoDb.id, accessToken, validRefreshToken.token, saveCacheValue)
    }
    else {
      await this.cacheService.setUserAccessTokenCache(clientCode, userInfoDb.id, accessToken, saveCacheValue)
    }
    
    console.log('User loaded from database and cached, user : ', userInfoDb);

    return saveCacheValue;
  }
}
