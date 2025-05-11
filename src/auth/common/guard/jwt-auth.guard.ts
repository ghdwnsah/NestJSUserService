import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

    canActivate(context: ExecutionContext) {
      const isPublic = this.reflector.getAllAndOverride<boolean>(
        'isPublic',
        [context.getHandler(), context.getClass()],
      );
      if (isPublic) return true;
      return super.canActivate(context);
    }

    handleRequest(err, user, info, context: ExecutionContext) {
        if (err) {
          throw err;
        }
    
        if (!user) {
            const authErrorMessage = info?.message;
            const authErrorName = info?.name;
          
            switch (authErrorName) {
              case 'TokenExpiredError':
                console.warn('[Guard] Access token expired');
                throw new UnauthorizedException('Session expired. Please login again.');
          
              case 'JsonWebTokenError':
                console.warn('[Guard] Invalid token');
                throw new UnauthorizedException('Invalid token. Please reauthenticate.');
          
              case 'NotBeforeError':
                console.warn('[Guard] Malformed token');
                throw new UnauthorizedException('Token not active yet.');
          
              default:
                console.warn('[Guard] Unknown authentication error');
                throw new UnauthorizedException('Authentication failed. Please login.');
            }
          }
    
        return user; 
      }
}