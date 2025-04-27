import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/core/infra/db/prisma.service';
// import { CustomCacheService } from '@/shared/cache/cache.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CustomCacheService } from '@/shared/cache/cache.service';
import { Request } from 'express'; // 여기서 express Request 명시!

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
    // private readonly cacheService: CustomCacheService,
    // @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly cacheService: CustomCacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const authHeader = req.headers['authorization']; // ex) Bearer xxx.yyy.zzz
    const accessToken = authHeader?.split(' ')[1];
    const userId = payload.id || payload.sub; // payload에서 id 또는 sub 가져오기

    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0] : req.ip;

    if (!accessToken) {
      throw new UnauthorizedException('No token found');
    }
    // 블랙리스트 조회
    const isBlacklisted = await this.cacheService.getIsAccessTokenBlacklistCache(userId, accessToken);
    if (isBlacklisted) {
      console.warn('Access token is blacklisted');
      throw new UnauthorizedException('Access token has been revoked');
    }
  
    // 캐시에서 유저 정보 조회
    let user = await this.cacheService.getAccessTokenCache(userId, accessToken);
    if (user) {
      console.log('User loaded from cache');
      console.log('JSON string, parse : ', JSON.parse(JSON.stringify(user)));

      return JSON.parse(JSON.stringify(user));
    }

    // 캐시에 없으면 DB에서 조회
    user = await this.prisma.user.findFirst({
      where: { id: payload.sub },
      include: {
        client: true,
        refreshTokens: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 캐시에 저장
    const validRefreshToken = user.refreshTokens.find(token => token.isValid);
    if (!validRefreshToken) {
      throw new UnauthorizedException('No valid refresh token found');
    }
    const saveCacheValue = {
      userId: user.id,
      userEmail: user.email,
      ip,
    } 
    await this.cacheService.setUserAllTokenCache(user.id, accessToken, validRefreshToken, saveCacheValue)
    
    console.log('User loaded from database and cached, user : ', user);

    return user;
  }
}
