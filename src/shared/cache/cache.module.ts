// import { CacheModule } from "@nestjs/cache-manager";
// import { Module } from "@nestjs/common";
// import { ConfigModule, ConfigService } from "@nestjs/config";
// // import { redisStore } from 'cache-manager-redis-store';
// import * as redisStore from 'cache-manager-redis-store';
// import { CustomCacheService } from "./cache.service";

// @Module({
//     imports: [  
//         CacheModule.registerAsync({
//             imports: [ConfigModule], 
//             inject: [ConfigService], 
//             useFactory: async (configService: ConfigService) => ({
//               store: redisStore,
//               host: configService.get<string>('REDIS_HOST') || 'localhost',
//               port: parseInt(configService.get<string>('REDIS_PORT'), 10) || 6379,
//               ttl: parseInt(configService.get<string>('CACHE_TTL'), 10) || 3600,
//               inject: [ConfigService],
//             }),
//             isGlobal: true,
//           }),
//       ],
//       providers: [
//         CustomCacheService,
//         {
//           provide: 'ACCESS_TOKEN_EXPIRE',
//           useValue: 3600,                 // 1시간
//         },
//         {
//           provide: 'REFRESH_TOKEN_EXPIRE_DB_AT',
//           useValue: 60 * 24 * 14,         // 14일
//         },
//         {
//           provide: 'REFRESH_TOKEN_EXPIRE',
//           useValue: 60 * 60 * 24 * 14,    // 14일
//         },
//       ],
//       exports: [
//         CustomCacheService,
//         'ACCESS_TOKEN_EXPIRE',
//         'REFRESH_TOKEN_EXPIRE_DB_AT', 
//         'REFRESH_TOKEN_EXPIRE',
//       ],
// })
// export class CustomCacheModule {}

