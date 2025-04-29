import { Test, TestingModule } from '@nestjs/testing';
import { UpdateRefreshAccessTokenHandler } from './update-refreshAccessToken.handler';
import { AuthService } from '../auth.service';
import { CustomCacheService } from '@/shared/cache/cache.service';
import { JwtService } from '@nestjs/jwt';
import { UpdateRefreshAccessTokenCommand } from './update-refreshAccessToken.command';

describe('UpdateRefreshAccessTokenHandler (IP 탈취 감지 테스트)', () => {
  let handler: UpdateRefreshAccessTokenHandler;
  let authService: AuthService;
  let cacheService: CustomCacheService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateRefreshAccessTokenHandler,
        {
            provide: 'RefreshTokenRepository',
            useValue: {
              findValidRefreshToken: jest.fn(),  // 필요한 mock 메서드 미리 선언
            },
        },
        {
            provide: 'UserRepository',
            useValue: {
              findUserById: jest.fn(),
            },
          },
        {
          provide: AuthService,
          useValue: {
            handleTokenTheft: jest.fn(),
          },
        },
        {
          provide: CustomCacheService,
          useValue: {
            getRefreshTokenCache: jest.fn(),
            setUserAccessTokenCache: jest.fn(),
            setUserAccessTokenBlacklistCache: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('newAccessToken'),
          },
        },
      ],
    }).compile();

    handler = module.get(UpdateRefreshAccessTokenHandler);
    authService = module.get(AuthService);
    cacheService = module.get(CustomCacheService);
    jwtService = module.get(JwtService);
  });

  describe('IP가 변경된 경우 handleTokenTheft를 호출해야 한다', () => {
    it('should detect IP change and call handleTokenTheft', async () => {
      // Given
      const userId = '01JS447X6N835NZ80HCMEAKDDQ';
      const refreshToken = 'ea7e6a64-00d2-46d3-bac4-11e7429755b9';
      const storedIp = '::1';    // 캐시에 저장된 IP
      const currentRequestIp = '2.2.2.2';  // 요청 들어온 IP

      // RefreshToken 캐시 mock
      (cacheService.getRefreshTokenCache as jest.Mock).mockResolvedValue({
        id: userId,
        ip: storedIp,
      });

      const command = new UpdateRefreshAccessTokenCommand(
        userId,
        refreshToken,
        currentRequestIp,
      );

      // When
      await handler.execute(command);

      // Then
      expect(authService.handleTokenTheft).toHaveBeenCalledWith(userId, currentRequestIp);
    });
  });
});