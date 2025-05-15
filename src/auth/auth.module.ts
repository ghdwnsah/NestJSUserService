import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import authConfig from '@/core/common/config/authConfig';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './application/jwt.strategy';
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
import { UpdateRefreshAccessTokenHandler } from './application/command/update-refreshAccessToken.handler';
import { ClientRepository } from '@/core/infra/db/repo/client.repository';
import { SlackService } from '@/shared/slack/slack.service';
import { NodemailerEmailService } from '@/email/infra/nodemailer-email.service';
import { GoogleStrategy } from './application/google.strategy';
import { GoogleSocialCreateOrLoginHandler } from './application/command/google_socialCreateOrLogin.handler';
import { TwoFactorAuthService } from './application/twoFactorAuth.service';
import { AccessTokenMiddleware } from '@/shared/middleware/access-token.middleware';
import { VerifyGenerateTwoFactorQrHandler } from './application/command/verify_generateTwoFactorQr.handler';
import { Login2faTrustedDeviceRegHandler } from './application/command/login_2faTrustedDeviceReg.handler';
import { DeviceTokenMiddleware } from '@/shared/middleware/device-token.middleware';
import { VerifyTwoFactorOtpHandler } from './application/command/verify_twoFactorOtp.handler';
import { TenantUserRepository } from '@/core/infra/db/repo/tenant-user.repository';
import { TenantModule } from '@/tenant/tenant.module';
import { TenantRefreshTokenRepository } from '@/core/infra/db/repo/tenant-refreshtoken.repository';
import { TenantTrustedDeviceRepository } from '@/core/infra/db/repo/tenant-trustedDevice.repository';
import { TenantIpDenylistRepository } from '@/core/infra/db/repo/tenant-ipDenyList.repository';


const CommandHandlers = [
    LoginUserHandler,
    VerifyUserEmailHandler,
    UpdateResetPasswordRequestHandler,
    UpdateResetPasswordConfirmHandler,
    UpdateRefreshAccessTokenHandler,
    GoogleSocialCreateOrLoginHandler,
    VerifyGenerateTwoFactorQrHandler,
    Login2faTrustedDeviceRegHandler,
    VerifyTwoFactorOtpHandler,
  ];

const StrategyHandlers = [
    JwtStrategy,
    GoogleStrategy,
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
                    expiresIn: parseInt(configService.get<string>('ACCESS_TOKEN_EXPIRE')),
                    issuer: 'hong.com',
                    audience: 'hong.com', 
                },
            }),
        }),
        PrismaModule,
        CqrsModule,
        TenantModule,
    ],
    controllers: [
        AuthController
    ],
    providers: [
        Logger,
        AuthService, 
        ...StrategyHandlers,
        CustomCacheService,
        SlackService,
        NodemailerEmailService,
        TwoFactorAuthService,
        { provide: 'UserRepository', useClass: UserRepository },
        { provide: 'ClientRepository', useClass: ClientRepository },
        { provide: 'RefreshTokenRepository', useClass: RefreshTokenRepository },
        TenantUserRepository,
        TenantRefreshTokenRepository,
        TenantTrustedDeviceRepository,
        TenantIpDenylistRepository,
        ...CommandHandlers,
    ],
    exports: [
        AuthService, 
        JwtModule
    ],
})
export class AuthModule {
    configure(consumer: MiddlewareConsumer) {
            consumer
              .apply(AccessTokenMiddleware, DeviceTokenMiddleware)
              .forRoutes('*');
          }
}