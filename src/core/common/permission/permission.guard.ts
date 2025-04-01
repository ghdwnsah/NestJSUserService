import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { Permission } from './permission.enum';
import { RolePermissionMap } from './permission.map';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [
        context.getHandler(), 
        context.getClass()
      ],
    );

    if (!requiredPermissions) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const rolePermissions = RolePermissionMap[user.role] || [];

    return requiredPermissions.every((perm) =>
      rolePermissions.includes(perm),
    );
  }
}