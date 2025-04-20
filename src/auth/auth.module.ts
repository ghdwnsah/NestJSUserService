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

const CommandHandlers = [
    LoginUserHandler,
    VerifyUserEmailHandler,
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
        { provide: 'UserRepository', useClass: UserRepository },
        ...CommandHandlers,
    ],
    exports: [
        AuthService, 
        JwtModule
    ],
})
export class AuthModule {}