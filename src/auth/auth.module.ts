import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import authConfig from 'src/config/authConfig';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [
        ConfigModule.forFeature(authConfig),
        PassportModule,
        JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { 
                    expiresIn: '1h',
                    issuer: 'hong.com',
                    audience: 'hong.com', 
                },
            }),
        }),
        PrismaModule,
    ],
    providers: [AuthService, JwtStrategy, AuthGuard],
    exports: [AuthService, JwtModule],
})
export class AuthModule {}