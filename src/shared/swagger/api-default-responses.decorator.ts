import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiDefaultResponses() {
  return applyDecorators(
    ApiResponse({ status: 200, description: '성공' }),
    ApiResponse({ status: 400, description: '잘못된 요청' }),
    ApiResponse({ status: 401, description: '인증 실패' }),
    ApiResponse({ status: 500, description: '서버 오류' }),
  );
}