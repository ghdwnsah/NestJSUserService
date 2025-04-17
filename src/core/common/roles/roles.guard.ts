import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY, 
      [
        context.getHandler(),
        context.getClass(),
      ]);
      // 권한이 빈 공백으로 없는 신규 유저 가입용
    if (!requiredRoles || requiredRoles.length === 0) return true; 
    

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}