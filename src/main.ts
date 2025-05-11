import { APP_FILTER, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import { LoggingInterceptor } from './core/infra/intercepter/logging.intercepter';

async function bootstrap() {
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
        format: winston.format.combine(
          winston.format.timestamp(),
          nestWinstonModuleUtilities.format.nestLike('MyAppUserService', {
            prettyPrint: true,
          }),
        ),
      }),
    ],
  });
  const app = await NestFactory.create<NestExpressApplication>(AppModule, 
    {
      logger,
      cors: true,
    });
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }))
  // app.useStaticAssets(join(__dirname, '..', 'public'));
  app.useStaticAssets(join(__dirname, 'public'));
  if (process.env.NODE_ENV === 'development') {
    console.log('swagger 문서 작동');
    const config = new DocumentBuilder()
    .setTitle('User Service API')
    .setDescription('API documentation for the User Service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
