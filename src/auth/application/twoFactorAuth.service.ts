import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { authenticator } from "otplib";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TwoFactorAuthService {
  constructor(
        private readonly configService: ConfigService,
  ) {}

  generateSecret(userEmail: string): { secret: string, otpAuthUrl: string } {
    const secret = authenticator.generateSecret();     
    const appName = this.configService.get<string>('APP_NAME');
    const otpAuthUrl = authenticator.keyuri(userEmail, appName, secret);
    return { secret, otpAuthUrl };
  }

  generateDeviceToken(): string {
    return uuidv4();
  }

  async isCodeValid(code: string, twoFactorSecret: string): Promise<boolean> {
    if (!twoFactorSecret) return false;
    return authenticator.verify({ 
      token: code, 
      secret: twoFactorSecret 
    });  // 코드 검증:contentReference[oaicite:13]{index=13}
  }
}