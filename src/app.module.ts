import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import emailConfig from './core/common/config/emailConfig';
import { validationSchema } from './core/common/config/validationSchema'
import { AuthModule } from './core/common/auth/auth.module';
import authConfig from './core/common/config/authConfig';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`${__dirname}/core/common/config/env/.${process.env.NODE_ENV}.env`],
      load: [emailConfig],
      isGlobal: true,
      validationSchema,
    }),
    ConfigModule.forFeature(authConfig), // 이게 있어야 Nest가 CONFIGURATION(auth)를 알 수 있음
    UsersModule, 
    EmailModule, 
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
