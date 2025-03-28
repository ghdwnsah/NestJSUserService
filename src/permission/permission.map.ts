import { Role } from '@prisma/client';
import { Permission } from './permission.enum';

export const RolePermissionMap: Record<Role, Permission[]> = {
  SuperAdmin: [
    Permission.CreateUser,
    Permission.DeleteUser,
    Permission.ManageBilling,
    Permission.ViewAnalytics,
  ],
  ClientAdmin: [
    Permission.CreateUser,
    Permission.ViewAnalytics,
  ],
  ClientUser: [],
};