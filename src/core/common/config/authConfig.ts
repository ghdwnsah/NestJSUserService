import { registerAs } from "@nestjs/config";

export default registerAs('auth', () => ({
        jwtSecret: process.env.JWT_SECRET,

        accessTokenExpiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRE || `${60 * 60}`, 10), // seconds, 1 시간
        accessTokenCacheExpiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRE_CACHE || `${60 * 60 * 1000}`, 10), // ms, 1 시간
        accessTokenBlacklistCacheExpiresIn: parseInt(process.env.ACCESS_TOKEN_BLACKLIST_EXPIRE_CACHE || `${60 * 60 * 1000}`, 10), // ms, 1 시간

        refreshTokenExpiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRE || `${60 * 60 * 24 * 14}`, 10), // seconds, 14 일
        refreshTokenCacheExpiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRE_CACHE || `${60 * 60 * 24 * 14 * 1000}`, 10), // ms, 14 일
        refreshTokenExpireInDbAt: parseInt(process.env.REFRESH_TOKEN_EXPIRE_DB_AT || `${60 * 24 * 14}`, 10),
    })
)