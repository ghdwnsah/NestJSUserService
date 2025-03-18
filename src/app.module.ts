import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: (process.env.NODE_ENV === 'production') ? '.production.env'
        : (process.env.NODE_ENV === 'stage') ? '.stage.env' : '.development.env'
    }),
    UsersModule, 
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
