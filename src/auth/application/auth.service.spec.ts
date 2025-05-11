import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '@/core/infra/db/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CustomCacheService } from '@/shared/cache/cache.service';
import { SlackService } from '@/shared/slack/slack.service';
import { NodemailerEmailService } from '@/email/infra/nodemailer-email.service';
import { UnauthorizedException } from '@nestjs/common';
import { UserInfo } from '@/core/interface/userInfo';
import * as geoip from 'geoip-lite';

jest.mock('geoip-lite'); // geoip 모듈을 mock 처리함

describe('AuthService - Suspicious IP Test', () => {
  let authService: AuthService;
  let slackService: SlackService;
  let emailService: NodemailerEmailService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: PrismaService,
          useValue: {
            refreshToken: {
              updateMany: jest.fn(),
            },
            trustedDevice: {
              findUnique: jest.fn().mockResolvedValue({
                deviceToken: 'mock-token',
                userId: 'user-123',
                ipAddress: '123.123.123.123', // 등록된 신뢰 IP
                expiresAt: new Date(Date.now() + 10000),
              }),
            },
            ipDenylist: {
              upsert: jest.fn(),
            },
            user: {
              findUnique: jest.fn().mockResolvedValue({
                id: 'user-123',
                email: 'test@example.com',
                name: '테스트유저',
              }),
              update: jest.fn(),
            },
          },
        },
        {
          provide: CustomCacheService,
          useValue: {
            setUserAccessTokenBlacklistCache: jest.fn(),
            clearUserAllTokenCaches: jest.fn(),
          },
        },
        {
          provide: SlackService,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
        {
          provide: NodemailerEmailService,
          useValue: {
            sendSecurityAlertEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    prismaService = module.get(PrismaService);
    slackService = module.get(SlackService);
    emailService = module.get(NodemailerEmailService);
  });

  it('IP가 다르면 UnauthorizedException 발생하고, geoip/slack/email이 호출된다', async () => {
    // 1. mock 사용자 정보
    const mockUser: UserInfo = {
      id: 'user-123',
      email: 'test@example.com',
      name: '테스트유저',
      clientId: 'client-xyz',
      isTwoFactorEnabled: true,
    };

    const actualIp = '222.222.222.222'; // 실제 로그인 시 사용한 IP (다름)
    const userAgent = 'Test-Agent';

    // 2. geoip 결과 mocking
    (geoip.lookup as jest.Mock).mockReturnValue({
      city: 'Seoul',
      country: 'KR',
    });

    // 3. 실제 로그인 시도 → 실패해야 함
    await expect(
      authService.login(mockUser, actualIp, 'mock-token', userAgent),
    ).rejects.toThrow(UnauthorizedException);

    // 4. geoip, slack, email 함수들이 호출되었는지 검증
    expect(geoip.lookup).toHaveBeenCalledWith(actualIp);
    expect(slackService.sendMessage).toHaveBeenCalled();
    expect(emailService.sendSecurityAlertEmail).toHaveBeenCalledWith(
      'test@example.com',
      '테스트유저',
      actualIp,
      expect.any(String), // resetToken은 uuid, 값은 중요하지 않음
      expect.any(Number), // 만료 시간 (30)
      'Seoul, KR' // locationText
    );
  });
});