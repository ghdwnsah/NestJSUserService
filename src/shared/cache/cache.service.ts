// import { Inject, Injectable } from "@nestjs/common";
// import { Cache } from 'cache-manager';

// @Injectable()
// export class CustomCacheService {
//     constructor(
//         @Inject('CACHE_MANAGER') private cacheManager: Cache,
//         @Inject('ACCESS_TOKEN_EXPIRE') private accessTokenExpire: number,
//         @Inject('REFRESH_TOKEN_EXPIRE') private refreshTokenExpire: number,
//     ){}

//     async getAccessCache (jwtString: string) {
//         return await this.cacheManager.get<any>(`access:${jwtString}`);        
//     }
//     async getRefreshCache (jwtString: string) {
//         return await this.cacheManager.get<any>(`refresh:${jwtString}`);        
//     }
//     async getAllCache (accessToken: string) {
//         return await this.cacheManager.get<any>(`allToken:${accessToken}`);        
//     }

//     async setAccessCache (jwtString: string, value: any, ttl?: number) {
//         console.log('cacheManager store : ', this.cacheManager.stores);
//         return await this.cacheManager.set(`access:${jwtString}`, value, ttl ? ttl : this.accessTokenExpire );
//     }
//     async setRefreshCache (jwtString: string, value: any, ttl?: number) {
//         console.log('cacheManager store : ', this.cacheManager.stores);
//         return await this.cacheManager.set(`refresh:${jwtString}`, value, ttl ? ttl : this.refreshTokenExpire );
//     }
//     async setAllCache (accessToken: string, refreshToken: string, value: any, ttl?: number) {
//         console.log('cacheManager store : ', this.cacheManager.stores);
//         await this.cacheManager.set(`access:${accessToken}`, value, ttl ? ttl : this.accessTokenExpire );
//         return await this.cacheManager.set(`refresh:${refreshToken}`, value, ttl ? ttl : this.refreshTokenExpire );
//     }

//     async clearAccessCache(jwtString: string) {
//         return await this.cacheManager.del(`access:${jwtString}`);
//     }
//     async clearRefreshCache(jwtString: string) {
//         return await this.cacheManager.del(`refresh:${jwtString}`);
//     }
// }