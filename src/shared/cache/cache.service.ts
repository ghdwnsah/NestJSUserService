import authConfig from "@/core/common/config/authConfig";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { Cache } from 'cache-manager';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { TokenCachePayload } from "@/core/interface/cache/token.interface";

const getUserTokenPrefix = (userId: string | number) => `user:${userId}:token`;
const getUserAccessTokenPrefix = (userId: string | number) => `${getUserTokenPrefix(userId)}:access`;
const getUserRefreshTokenPrefix = (userId: string | number) => `${getUserTokenPrefix(userId)}:refresh`;
const getUserDeviceTokenPrefix = (userId: string | number) => `${getUserTokenPrefix(userId)}:device`;
const getUserBlacklistTokenPrefix = (userId: string | number) => `${getUserTokenPrefix(userId)}:blacklist`;

const getTenantDbUrlPrefix = (clientCode: string) => `tenant:${clientCode}:dbUrl`;

@Injectable()
export class CustomCacheService {
    constructor(
        @Inject('CACHE_MANAGER') private cacheManager: Cache,
        @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
        @InjectRedis() private readonly redis: Redis,
    ){}

    async getAccessTokenCache (userId: string, jwtString: string): Promise<TokenCachePayload> {
        const prefix = getUserAccessTokenPrefix(userId);
        return await this.cacheManager.get<any>(`${prefix}:${jwtString}`);
    }
    async getRefreshTokenCache (userId: string, jwtString: string): Promise<TokenCachePayload> {
        const prefix = getUserRefreshTokenPrefix(userId);
        return await this.cacheManager.get<any>(`${prefix}:${jwtString}`);        
    }
    async getIsAccessTokenBlacklistCache(userId: string, jwtString: string) {
        const prefix = getUserBlacklistTokenPrefix(userId);
        console.log(`${prefix}:${jwtString}`);
        const isBlacklist = await this.cacheManager.get(`${prefix}:${jwtString}`);
        console.log('블랙리스트 찾음 : ', isBlacklist);
        if(isBlacklist) return true;
        else return false;
    }
    async getTenantClientDbUrlCache(clientCode: string): Promise<string> {
        const prefix = getTenantDbUrlPrefix(clientCode);
        return await this.cacheManager.get<string>(prefix);
    }

    async setUserAccessTokenCache (userId: string, jwtString: string, value: any, ttl?: number) {
        const prefix = getUserAccessTokenPrefix(userId);
        await this.cacheManager.set(`${prefix}:${jwtString}`, value, ttl ? ttl : this.config.accessTokenCacheExpiresIn );
    }
    async setUserRefreshTokenCache (userId: string, jwtString: string, value: any, ttl?: number) {
        const prefix = getUserRefreshTokenPrefix(userId);
        await this.cacheManager.set(`${prefix}:${jwtString}`, value, ttl ? ttl : this.config.refreshTokenCacheExpiresIn );
    }
    async setUserDeviceTokenCache (userId: string, jwtString: string, value: any, ttl?: number) {
        const prefix = getUserDeviceTokenPrefix(userId);
        await this.cacheManager.set(`${prefix}:${jwtString}`, value, ttl ? ttl : this.config.refreshTokenCacheExpiresIn );
    }
    async setUserAllTokenCache (userId: string, accessToken: string, refreshToken: string, value: any, deviceToken?: string, ttl?: number) {   
        await this.setUserAccessTokenCache(userId, accessToken, value);
        await this.setUserRefreshTokenCache(userId, refreshToken, value);
        if(deviceToken) {
            await this.setUserDeviceTokenCache(userId, deviceToken, value);
        }
    }
    async setUserAccessTokenBlacklistCache(userId: string) {
        const prefix = getUserAccessTokenPrefix(userId);
        let cursor = '0';
    
        do {
            const [newCursor, keys] = await this.redis.scan(cursor, 'MATCH', `${prefix}:*`, 'COUNT', 100);
            cursor = newCursor;
    
            if (keys.length > 0) {
                for (const key of keys) {
                    const token = key.split(':').pop(); // 키에서 jwtString 부분만 추출
                    if (token) {
                        const blacklistKey = `${getUserBlacklistTokenPrefix(userId)}:${token}`;    
                        if (this.config.accessTokenBlacklistCacheExpiresIn > 0) {                           
                            await this.cacheManager.set(blacklistKey, 'blacklisted', this.config.accessTokenBlacklistCacheExpiresIn);
                        } else {
                            // 혹시 TTL이 없거나 음수라면 기본 TTL (1시간) 적용
                            await this.cacheManager.set(blacklistKey, 'blacklisted', 60 * 60 * 1000);
                        }
                    }
                }   
            }
        } while (cursor !== '0');
    }
    async setTenantClientDbUrlCache(clientCode: string, dbUrl: string) {
        const prefix = getTenantDbUrlPrefix(clientCode);
        await this.cacheManager.set(prefix, dbUrl, this.config.tenantClientDbUrlCacheExpiresIn); 
    }

    async clearAccessCache(userId: string, jwtString: string) {
        const prefix = getUserAccessTokenPrefix(userId);
        await this.cacheManager.del(`${prefix}:${jwtString}`);
    }
    async clearRefreshCache(userId: string, jwtString: string) {
        const prefix = getUserRefreshTokenPrefix(userId);
        await this.cacheManager.del(`${prefix}:${jwtString}`);
    }
    async clearUserAllTokenCaches(userId: string) {
        await this.deleteKeysByPattern(`${getUserAccessTokenPrefix(userId)}:*`);
        await this.deleteKeysByPattern(`${getUserRefreshTokenPrefix(userId)}:*`);
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