import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/core/infra/db/prisma.service';
// import { CustomCacheService } from '@/shared/cache/cache.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
    // private readonly cacheService: CustomCacheService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    const token = authHeader?.split(' ')[1];
  
    console.log('===TOKEN 검증 시===');
    console.log(`[[${token}]]`, token.length);

    console.log('validate payload : ', payload);
    // 1. 캐시에서 유저 정보 조회
    // let user = await this.cacheService.getAccessCache(token);
    let user = await await this.cacheManager.get<any>(`access:${token}`);
    console.log('cache user : ', user);
    if (user) {
      console.log('User loaded from cache');
      console.log('JSON string, parse : ', JSON.parse(JSON.stringify(user)));

      return JSON.parse(JSON.stringify(user));
    }

    console.log('JwtStrategy class validate()');
    // 2. 캐시에 없으면 DB에서 조회
    user = await this.prisma.user.findFirst({
      where: { id: payload.sub },
      include: {
        client: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    
    // console.log('User loaded from database and cached');

    console.log('JwtStrategy class user :', user);
    return user;
  }
}
