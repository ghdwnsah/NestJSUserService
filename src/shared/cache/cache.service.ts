import authConfig from "@/core/common/config/authConfig";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { Cache } from 'cache-manager';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { TokenCachePayload } from "@/core/interface/cache/token.interface";

const getClientPrefix = (clientCode: string) => `client:${clientCode}`;

const getUserTokenPrefix = (clientCode: string, userId: string | number) => `${getClientPrefix(clientCode)}:user:${userId}:token`;
const getUserAccessTokenPrefix = (clientCode: string, userId: string | number) => `${getUserTokenPrefix(clientCode, userId)}:access`;
const getUserRefreshTokenPrefix = (clientCode: string, userId: string | number) => `${getUserTokenPrefix(clientCode, userId)}:refresh`;
const getUserDeviceTokenPrefix = (clientCode: string, userId: string | number) => `${getUserTokenPrefix(clientCode, userId)}:device`;
const getUserBlacklistTokenPrefix = (clientCode: string, userId: string | number) => `${getUserTokenPrefix(clientCode, userId)}:blacklist`;

const getTenantDbUrlPrefix = (clientCode: string) => `tenant:${clientCode}:dbUrl`;

@Injectable()
export class CustomCacheService {
  constructor(
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
    @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async getAccessTokenCache(clientCode: string, userId: string, jwtString: string): Promise<TokenCachePayload> {
    const prefix = getUserAccessTokenPrefix(clientCode, userId);
    return await this.cacheManager.get<any>(`${prefix}:${jwtString}`);
  }

  async getRefreshTokenCache(clientCode: string, userId: string, jwtString: string): Promise<TokenCachePayload> {
    const prefix = getUserRefreshTokenPrefix(clientCode, userId);
    return await this.cacheManager.get<any>(`${prefix}:${jwtString}`);        
  }

  async getIsAccessTokenBlacklistCache(clientCode: string, userId: string, jwtString: string) {
    const prefix = getUserBlacklistTokenPrefix(clientCode, userId);
    console.log(`${prefix}:${jwtString}`);
    const isBlacklist = await this.cacheManager.get(`${prefix}:${jwtString}`);
    console.log('블랙리스트 찾음 : ', isBlacklist);
    return !!isBlacklist;
  }

  async getTenantClientDbUrlCache(clientCode: string): Promise<string> {
    const prefix = getTenantDbUrlPrefix(clientCode);
    return await this.cacheManager.get<string>(prefix);
  }

  async setUserAccessTokenCache(clientCode: string, userId: string, jwtString: string, value: any, ttl?: number) {
    const prefix = getUserAccessTokenPrefix(clientCode, userId);
    await this.cacheManager.set(`${prefix}:${jwtString}`, value, ttl ?? this.config.accessTokenCacheExpiresIn);
  }

  async setUserRefreshTokenCache(clientCode: string, userId: string, jwtString: string, value: any, ttl?: number) {
    const prefix = getUserRefreshTokenPrefix(clientCode, userId);
    await this.cacheManager.set(`${prefix}:${jwtString}`, value, ttl ?? this.config.refreshTokenCacheExpiresIn);
  }

  async setUserDeviceTokenCache(clientCode: string, userId: string, jwtString: string, value: any, ttl?: number) {
    const prefix = getUserDeviceTokenPrefix(clientCode, userId);
    await this.cacheManager.set(`${prefix}:${jwtString}`, value, ttl ?? this.config.refreshTokenCacheExpiresIn);
  }

  async setUserAllTokenCache(clientCode: string, userId: string, accessToken: string, refreshToken: string, value: any, deviceToken?: string, ttl?: number) {
    await this.setUserAccessTokenCache(clientCode, userId, accessToken, value, ttl);
    await this.setUserRefreshTokenCache(clientCode, userId, refreshToken, value, ttl);
    if (deviceToken) {
      await this.setUserDeviceTokenCache(clientCode, userId, deviceToken, value, ttl);
    }
  }

  async setUserAccessTokenBlacklistCache(clientCode: string, userId: string) {
    const prefix = getUserAccessTokenPrefix(clientCode, userId);
    let cursor = '0';

    do {
      const [newCursor, keys] = await this.redis.scan(cursor, 'MATCH', `${prefix}:*`, 'COUNT', 100);
      cursor = newCursor;

      if (keys.length > 0) {
        for (const key of keys) {
          const token = key.split(':').pop(); // 키에서 jwtString 부분만 추출
          if (token) {
            const blacklistKey = `${getUserBlacklistTokenPrefix(clientCode, userId)}:${token}`;
            await this.cacheManager.set(
              blacklistKey,
              'blacklisted',
              this.config.accessTokenBlacklistCacheExpiresIn > 0
                ? this.config.accessTokenBlacklistCacheExpiresIn
                : 60 * 60 * 1000
            );
          }
        }
      }
    } while (cursor !== '0');
  }

  async setTenantClientDbUrlCache(clientCode: string, dbUrl: string) {
    const prefix = getTenantDbUrlPrefix(clientCode);
    await this.cacheManager.set(prefix, dbUrl, this.config.tenantClientDbUrlCacheExpiresIn); 
  }

  async clearAccessCache(clientCode: string, userId: string, jwtString: string) {
    const prefix = getUserAccessTokenPrefix(clientCode, userId);
    await this.cacheManager.del(`${prefix}:${jwtString}`);
  }

  async clearRefreshCache(clientCode: string, userId: string, jwtString: string) {
    const prefix = getUserRefreshTokenPrefix(clientCode, userId);
    await this.cacheManager.del(`${prefix}:${jwtString}`);
  }

  async clearUserAllTokenCaches(clientCode: string, userId: string) {
    await this.deleteKeysByPattern(`${getUserAccessTokenPrefix(clientCode, userId)}:*`);
    await this.deleteKeysByPattern(`${getUserRefreshTokenPrefix(clientCode, userId)}:*`);
  }

  private async deleteKeysByPattern(pattern: string) {
    let cursor = '0';

    do {
      const [newCursor, keys] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = newCursor;

      if (keys.length) {
        await Promise.all(keys.map(key => this.cacheManager.del(key)));
      }
    } while (cursor !== '0');
  }
}