import { Request as ExpressRequest } from 'express';
import { UserInfo } from '@/core/interface/userInfo'; // req.user 타입
import { User } from '@prisma/client';

export interface AuthenticatedRequest extends ExpressRequest {
  user: UserInfo;
}