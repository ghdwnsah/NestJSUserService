import { CacheModule } from "@nestjs/cache-manager";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CustomCacheService } from "./cache.service";
import { createKeyv } from "@keyv/redis";
import { RedisModule } from "@nestjs-modules/ioredis";

@Global()
@Module({
    imports: [  
        CacheModule.registerAsync({
            isGlobal: true,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
              stores: [createKeyv(`redis://${config.get<string>('REDIS_HOST') || 'localhost'}:${config.get<string>('REDIS_PORT') || 6379}`)],
              ttl: parseInt(config.get<string>('CACHE_TTL'), 10) || 3600000,
            })
          }),
          
          RedisModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
              type: 'single',
              options: {
                host: configService.get<string>('REDIS_HOST') || 'localhost',
                port: parseInt(configService.get<string>('REDIS_PORT') || '6379', 10),
              },
            }),
          }),
      ],
      providers: [
        CustomCacheService,
      ],
      exports: [
        CustomCacheService,
      ],
})
export class CustomCacheModule {}

