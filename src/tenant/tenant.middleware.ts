import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId || typeof tenantId !== 'string') {
      throw new BadRequestException('X-Tenant-ID header is missing or invalid.');
    }

    req['tenantId'] = tenantId;
    console.log('Tenant ID:', tenantId);
    console.log('Request Headers:', req['tenantId']);
    next();
  }
}