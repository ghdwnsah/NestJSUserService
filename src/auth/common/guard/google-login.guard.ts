import { BadRequestException, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class GoogleLoginGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    console.log('GoogleLoginGuard getAuthenticateOptions called');
    const request = context.switchToHttp().getRequest();
    const { role, clientCode } = request.query;

    if (!role || !clientCode) throw new BadRequestException('필수값 누락');
    return {
      scope: ['email', 'profile'],
      state: JSON.stringify({ role, clientCode }),
    };
  }
}