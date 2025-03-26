import * as jwt from 'jsonwebtoken';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { privateDecrypt } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import authConfig from 'src/config/authConfig';
import { UserInfo } from 'src/users/userInfo';

@Injectable()
export class AuthService {
    constructor(
        @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
        private readonly jwtService: JwtService,
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
}
