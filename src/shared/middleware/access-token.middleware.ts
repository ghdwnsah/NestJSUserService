import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AccessTokenMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // favicon.ico 무시
    if (req.originalUrl === '/favicon.ico') {
      return next();
    }

    const authHeader = req.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const [, token] = authHeader.split(' ');
      req['token'] = token;
    }

    next();
  }
}