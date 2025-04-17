// import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { ConfigService } from '@nestjs/config';
// import { PrismaService } from '@/core/infra/db/prisma.service';
// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { Cache } from 'cache-manager';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
//   constructor(
//     configService: ConfigService,
//     private readonly prisma: PrismaService,
//     @Inject(CACHE_MANAGER) private cacheManager: Cache,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: configService.get<string>('JWT_SECRET'),
//     });
//   }

//   async validate(payload: any) {
//     const cacheKey = `user:${payload.sub}`;

//     // 1. 캐시에서 유저 정보 조회
//     let user = await this.cacheManager.get(cacheKey);
//     if (user) {
//       console.log('User loaded from cache');
//       console.log('JSON string, parse : ', JSON.parse(JSON.stringify(user)));

//       return JSON.parse(JSON.stringify(user));
//     }

//     // 2. 캐시에 없으면 DB에서 조회
//     user = await this.prisma.user.findFirst({
//       where: { id: payload.sub },
//       include: {
//         client: true,
//       },
//     });

//     if (!user) {
//       throw new UnauthorizedException('User not found');
//     }

//     // 3. 캐시에 저장 (유효 시간: 5분)
//     await this.cacheManager.set(cacheKey, user, 300);
//     console.log('User loaded from database and cached');

//     return user;
//   }

//   async updateUser(userId: string, updateData: any) {
//     const updatedUser = await this.prisma.user.update({
//       where: { id: userId },
//       data: updateData,
//     });

//     // 캐시 무효화
//     const cacheKey = `user:${userId}`;
//     await this.cacheManager.del(cacheKey);

//     return updatedUser;
//   }
// }
