import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './role.enum';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY, 
      [
        context.getHandler(),
        context.getClass(),
      ]);
      // 권한이 빈 공백으로 없는 신규 유저 가입용, isPublic이 true인 경우는 권한 체크를 하지 않음으로 통합
    if (!requiredRoles || requiredRoles.length === 0) return false; 
    

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}