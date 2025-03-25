import * as jwt from 'jsonwebtoken';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { privateDecrypt } from 'crypto';
import authConfig from 'src/config/authConfig';

interface User {
    id: string;
    name: string;
    email: string;
}

@Injectable()
export class AuthService {
    constructor(
        @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
    ) {}

    login(user: User) {
        console.log('login 호출')
        const payload = { ...user };

        return jwt.sign(payload, this.config.jwtSecret, {
            expiresIn: '1d',
            audience: 'hong.com',
            issuer: 'hong.com',
        });
    }
}
