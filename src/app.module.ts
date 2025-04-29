import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import emailConfig from './core/common/config/emailConfig';
import { validationSchema } from './core/common/config/validationSchema'
import { AuthModule } from './auth/auth.module';
import authConfig from './core/common/config/authConfig';
import { ClientAdminsModule } from './client-admins/client-admins.module';
import * as winston from 'winston';
import {
utilities as nestWinstonModuleUtilities,
WinstonModule,
} from 'nest-winston';
import { CacheModule } from '@nestjs/cache-manager';
// import * as redisStore from 'cache-manager-redis-store';
// import {redisStore} from 'cache-manager-redis-store';
// import * as redisStore from 'cache-manager-ioredis';
import {redisStore} from 'cache-manager-ioredis-yet';
import { RedisClientOptions } from 'redis';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './shared/filter/httpException.filter';
import KeyvRedis, { createKeyv } from '@keyv/redis';
import { CustomCacheModule } from './shared/cache/cache.module';
import { LoggingModule } from './core/infra/logging.module';
import { SlackModule } from './shared/slack/slack.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`${__dirname}/core/common/config/env/.${process.env.NODE_ENV}.env`],
      load: [
        authConfig, 
        emailConfig,
      ],
      cache: true,
      validationSchema,
    }),
    // ConfigModule.forFeature(authConfig), // 이게 있어야 Nest가 CONFIGURATION(auth)를 알 수 있음 
    EmailModule, 
    AuthModule,
    ClientAdminsModule,
    WinstonModule.forRoot({
	    transports: [
	      new winston.transports.Console({
	        // level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
	        level: 'silly',
	        format: winston.format.combine(
	          winston.format.timestamp(),
	          nestWinstonModuleUtilities.format.nestLike('MyAppUserService', { prettyPrint: true }),
	        ),
	      })
	    ]
	  }),
    CustomCacheModule,
    LoggingModule,
    SlackModule,
    // CacheModule.registerAsync({ 
    //   isGlobal: true,
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (config: ConfigService) => ({
    //     stores: [createKeyv(`redis://${config.get<string>('REDIS_HOST') || 'localhost'}:${config.get<string>('REDIS_PORT') || 6379}`)],
    //     ttl: parseInt(config.get<string>('CACHE_TTL'), 10) || 3600000,
    //   })
    // })
    // CacheModule.register({ 
    //   isGlobal: true,
    //   stores: [ createKeyv('redis://localhost:6379') ],
    // })

    // CacheModule.registerAsync({
    //   isGlobal: true,
    //   imports: [ConfigModule], 
    //   inject: [ConfigService], 
    //   useFactory: async (config: ConfigService) => {{
    //     stores: [createKeyv('redis://localhost:6379'),
    //     ttl: parseInt(config.get<string>('CACHE_TTL'), 10) || 3600000,
      
    //   }
        
    //   },
    // }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
    Logger,
  ],
})
export class AppModule {}
