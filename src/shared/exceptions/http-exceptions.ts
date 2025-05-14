import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

export function errorResponseClientBadRequest(message = '잘못된 요청입니다') {
  throw new BadRequestException(message);
}

export function errorResponseClientUnauthorized(message = '인증이 필요합니다') {
  throw new UnauthorizedException(message);
}

export function errorResponseClientNotFound(message = '데이터를 찾을 수 없습니다') {
  throw new NotFoundException(message);
}

export function errorResponseClientForbidden(message = '권한이 없습니다') {
  throw new ForbiddenException(message);
}