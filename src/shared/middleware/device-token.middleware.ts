import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class DeviceTokenMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('DeviceTokenMiddleware called');
    // favicon.ico 무시
    if (req.originalUrl === '/favicon.ico') {
      return next();
    }

    const deviceToken = req?.headers['x-device-token'] as string;

    if (deviceToken) {
        req['deviceToken'] = deviceToken;
    }

    // console.log('DeviceTokenMiddleware called ended', req['deviceToken']);
    next();
  }
}