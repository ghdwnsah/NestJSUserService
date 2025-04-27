import { Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import authConfig from '@/core/common/config/authConfig';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '@/core/infra/db/prisma.module';
import { VerifyAndLoginUseCase } from './verifyAndLogin.usecase';
import { UserRepository } from '@/core/infra/db/repo/user.repository.impl';
import { AuthController } from './interface/auth.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { VerifyUserEmailHandler } from './application/command/verify-userEmail.handler';
import { LoginUserHandler } from './application/command/login-user.handler';
import { RefreshTokenRepository } from '@/core/infra/db/repo/refreshtoken.repository';
import { UpdateResetPasswordRequestHandler } from './application/command/update-resetPasswordRequest.handler';
import { UpdateResetPasswordConfirmHandler } from './application/command/update-resetPasswordconfirm.handler';
import { CustomCacheService } from '@/shared/cache/cache.service';


const CommandHandlers = [
    LoginUserHandler,
    VerifyUserEmailHandler,
    UpdateResetPasswordRequestHandler,
    UpdateResetPasswordConfirmHandler,
  ];

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
        CqrsModule,
    ],
    controllers: [
        AuthController
    ],
    providers: [
        AuthService, 
        JwtStrategy,
        CustomCacheService,
        { provide: 'UserRepository', useClass: UserRepository },
        { provide: 'UserRepository', useClass: UserRepository },
        { provide: 'RefreshTokenRepository', useClass: RefreshTokenRepository },
        ...CommandHandlers,
    ],
    exports: [
        AuthService, 
        JwtModule
    ],
})
export class AuthModule {}