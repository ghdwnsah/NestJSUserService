import * as jwt from 'jsonwebtoken';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { privateDecrypt } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import authConfig from 'src/config/authConfig';
import { UserInfo } from 'src/users/userInfo';
import { PrismaService } from 'src/prisma/prisma.service';

import { v4 as uuidv4 } from 'uuid';
import { addMinutes } from 'date-fns';

@Injectable()
export class AuthService {
    constructor(
        @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
        private readonly jwtService: JwtService,
        private readonly prismaService: PrismaService
    ) {}

    login(user: UserInfo) {
        console.log('login 호출')
        const payload = { ...user };

        // return jwt.sign(payload, this.config.jwtSecret, {
        //     expiresIn: '1d',
        //     audience: 'hong.com',
        //     issuer: 'hong.com',
        // });

        return this.jwtService.sign({ 
            sub: user.id, 
            email: user.email,
            audience: 'hong.com',
            issuer: 'hong.com',
        });
    }

    // TODO : nest jwt 버전으로 수정
    verify(jwtString: string) {
        try {
            const payload = jwt.verify(jwtString, this.config.jwtSecret) as (jwt.JwtPayload | string) & UserInfo
            const {id, email} = payload;
            return {
                userId: id,
                email
            }
        } catch (e) {
            throw new UnauthorizedException();
        }
    }

    async generateTokens(user: UserInfo, ip: string) {
        const accessToken = this.jwtService.sign({ sub: user.id, email: user.email }, {
          expiresIn: '15m',
          audience: 'hong.com',
          issuer: 'hong.com',
        });
    
        const refreshToken = uuidv4();
        const expiresAt = addMinutes(new Date(), 60 * 24 * 14); // 14일
    
        await this.prismaService.refreshToken.create({
          data: {
            token: refreshToken,
            userId: user.id,
            expiresAt,
            ip,
          },
        });
    
        return { accessToken, refreshToken };
      }

      async refreshTokens(refreshToken: string, ip: string) {
        const tokenRecord = await this.prismaService.refreshToken.findUnique({ where: { token: refreshToken } });
    
        if (!tokenRecord || !tokenRecord.isValid) {
          throw new ForbiddenException('Invalid refresh token');
        }
    
        if (tokenRecord.expiresAt < new Date()) {
          await this.invalidateUserTokens(tokenRecord.userId);
          throw new ForbiddenException('Refresh token expired');
        }
    
        if (tokenRecord.ip !== ip) {
          await this.handleTokenTheft(tokenRecord.userId, ip);
          throw new ForbiddenException('Token theft suspected');
        }
    
        await this.prismaService.refreshToken.update({
          where: { token: refreshToken },
          data: { isValid: false },
        });
    
        const user = await this.prismaService.user.findUnique({ where: { id: tokenRecord.userId } });
        return this.generateTokens(user, ip);
      }
    
      async invalidateUserTokens(userId: string) {
        await this.prismaService.refreshToken.updateMany({
          where: { userId, isValid: true },
          data: { isValid: false },
        });
      }
    
      async handleTokenTheft(userId: string, suspiciousIp: string) {
        await this.invalidateUserTokens(userId);
        console.warn(`[SECURITY] Refresh token theft suspected from IP: ${suspiciousIp}`);
        // TODO: notify user via email or system log
        // TODO: add suspicious IP to denylist (optional)
      }
}
