import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '@/core/infra/db/prisma.service';
import { CustomCacheService } from '@/shared/cache/cache.service';
import { JwtService } from '@nestjs/jwt';
import { SlackService } from '@/shared/slack/slack.service';
import { NodemailerEmailService } from '@/email/infra/nodemailer-email.service';

describe('AuthService - handleTokenTheft', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let slackService: SlackService;
  let emailService: NodemailerEmailService;

  let email = 'ghdwwns@gmail.com';
  let name = '홍길동';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            refreshToken: { updateMany: jest.fn() },
            ipDenylist: { upsert: jest.fn() },
            user: { findUnique: jest.fn().mockResolvedValue({ email, name }) },
          },
        },
        {
          provide: SlackService,
          useValue: { sendMessage: jest.fn() },
        },
        {
          provide: NodemailerEmailService,
          useValue: { sendSecurityAlertEmail: jest.fn() },
        },
        {
          provide: CustomCacheService,
          useValue: {}, // 필요 없으니 비워도 됨
        },
        {
          provide: JwtService,
          useValue: {}, // 필요 없으니 비워도 됨
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    prismaService = module.get(PrismaService);
    slackService = module.get(SlackService);
    emailService = module.get(NodemailerEmailService);
  });

  it('should invalidate user tokens, deny IP, and send notifications', async () => {
    // Given
    const userId = '01JS447X6N835NZ80HCMEAKDDQ';
    const suspiciousIp = '2.2.2.2';

    // When
    await authService.handleTokenTheft(userId, suspiciousIp);

    // Then
    expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId, isValid: true },
      data: { isValid: false },
    });

    expect(prismaService.ipDenylist.upsert).toHaveBeenCalledWith({
      where: { ip: suspiciousIp },
      update: {},
      create: { ip: suspiciousIp, reason: 'Token theft suspected' },
    });

    expect(slackService.sendMessage).toHaveBeenCalledWith(expect.stringContaining(suspiciousIp));

    expect(emailService.sendSecurityAlertEmail).toHaveBeenCalledWith(
      email,
      name,
      suspiciousIp,
    );
  });
});