import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err, user, info, context: ExecutionContext) {
        if (err) {
          throw err;
        }
    
        if (!user) {
            const authErrorMessage = info?.message;
          
            switch (authErrorMessage) {
              case 'jwt expired':
                console.warn('[Guard] Access token expired');
                throw new UnauthorizedException('Session expired. Please login again.');
          
              case 'invalid token':
                console.warn('[Guard] Invalid token');
                throw new UnauthorizedException('Invalid token. Please reauthenticate.');
          
              case 'jwt malformed':
                console.warn('[Guard] Malformed token');
                throw new UnauthorizedException('Malformed token. Please login again.');
          
              default:
                console.warn('[Guard] Unknown authentication error');
                throw new UnauthorizedException('Authentication failed. Please login.');
            }
          }
    
        return user; 
      }
}