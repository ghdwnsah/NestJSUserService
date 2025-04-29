import { ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { CommandHandler, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { UpdateRefreshAccessTokenCommand } from "./update-refreshAccessToken.command";
import { IRefreshTokenRepositoryForAuth } from "@/auth/infra/adaper/iRefreshToken.repository";
import { IUserRepositoryForAuth } from "@/auth/infra/adaper/iUser.repository";
import { JwtService } from "@nestjs/jwt";
import { CustomCacheService } from "@/shared/cache/cache.service";
import { TokenCachePayload } from "@/core/interface/cache/token.interface";
import { UserInfo } from "@/core/interface/userInfo";
import { AuthService } from "../auth.service";


@Injectable()
@CommandHandler(UpdateRefreshAccessTokenCommand)
export class UpdateRefreshAccessTokenHandler implements ICommandHandler<UpdateRefreshAccessTokenCommand>{
    constructor(
        @Inject('RefreshTokenRepository') private readonly refreshTokenRepo: IRefreshTokenRepositoryForAuth,
        @Inject('UserRepository') private userRepo: IUserRepositoryForAuth,
        private readonly jwtService: JwtService,
        private readonly cacheService: CustomCacheService,
        private readonly authService: AuthService,
    ) {}

    async execute(command: UpdateRefreshAccessTokenCommand): Promise<any> {
        const { refreshToken, userId, ip } = command;
        console.log('execute()')

        // refreshToken 유효성 검사
        let tokenCacheRecord = await this.cacheService.getRefreshTokenCache(userId, refreshToken);
        if (!tokenCacheRecord) {
            console.log('캐시에서 못찾음');            
            let refreshDbRecord = await this.refreshTokenRepo.findValidRefreshToken(refreshToken);
            if (!refreshDbRecord || refreshDbRecord.userId !== userId) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            if (refreshDbRecord.ip !== ip) {
                await this.authService.handleTokenTheft(refreshDbRecord.userId, ip);
                // throw new ForbiddenException('Token theft suspected');
            }
        } else {                
            console.log('캐시에서 찾음')
            if (tokenCacheRecord.id !== userId) {
                throw new UnauthorizedException('Invalid refresh token');
            }
            else { 
                if (tokenCacheRecord.ip !== ip) {
                    await this.authService.handleTokenTheft(tokenCacheRecord.id, ip);
                    // throw new ForbiddenException('Token theft suspected');
                }
                return await this.newAccessToken(tokenCacheRecord, ip);
            }
        }

        

        // 유저 정보 가져오기
        const user = await this.userRepo.findUserById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return await this.newAccessToken(user, ip);
    }

    async newAccessToken(user: UserInfo, ip: string) {
        // 새 accessToken 발급
        const cachePayload: TokenCachePayload = {
            id: user.id,
            name: user.name,
            email: user.email,
            clientId: user.clientId,
            ip,
            issuedAt: Date.now(),
        };
        const newAccessToken = this.jwtService.sign(cachePayload);

        // 캐시 절차
        await this.cacheService.setUserAccessTokenBlacklistCache(user.id);
        await this.cacheService.setUserAccessTokenCache(user.id, newAccessToken, cachePayload);

        return { accessToken: newAccessToken };
    }
}