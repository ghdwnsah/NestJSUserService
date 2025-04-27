import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { CommandHandler, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { UpdateRefreshAccessTokenCommand } from "./update-refreshAccessToken.command";
import { IRefreshTokenRepositoryForAuth } from "@/auth/infra/adaper/iRefreshToken.repository";
import { IUserRepositoryForAuth } from "@/auth/infra/adaper/iUser.repository";
import { JwtService } from "@nestjs/jwt";
import { CustomCacheService } from "@/shared/cache/cache.service";

@Injectable()
@CommandHandler(UpdateRefreshAccessTokenCommand)
export class UpdateRefreshAccessTokenHandler implements ICommandHandler<UpdateRefreshAccessTokenCommand>{
    constructor(
        @Inject('RefreshTokenRepository') private readonly refreshTokenRepo: IRefreshTokenRepositoryForAuth,
        @Inject('UserRepository') private userRepo: IUserRepositoryForAuth,
        private readonly jwtService: JwtService,
        private readonly cacheService: CustomCacheService,
    ) {}

    async execute(command: UpdateRefreshAccessTokenCommand): Promise<any> {
        const { refreshToken, userId } = command;
        console.log('execute()')

        // refreshToken 유효성 검사
        let tokenRecord = await this.cacheService.getRefreshTokenCache(userId, refreshToken);
        if (!tokenRecord) {
            console.log('캐시에서 못찾음');
            tokenRecord = await this.refreshTokenRepo.findValidRefreshToken(refreshToken);
            if (!tokenRecord) {
                throw new UnauthorizedException('Invalid refresh token');
            }
        }
        else {
            console.log('캐시에서 찾음');
            tokenRecord.userId = tokenRecord.id;
        }

        // 유저 정보 가져오기
        const user = await this.userRepo.findUserById(tokenRecord.userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // 새 accessToken 발급
        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
        };
        const newAccessToken = this.jwtService.sign(payload);

        // 캐시 절차
        await this.cacheService.setUserAccessTokenBlacklistCache(user.id);
        await this.cacheService.setUserAccessTokenCache(user.id, newAccessToken, payload);

        return { accessToken: newAccessToken };
    }
}