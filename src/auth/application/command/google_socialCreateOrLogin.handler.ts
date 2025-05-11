import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GoogleSocialCreateOrLoginCommand } from './google_socialCreateOrLogin.command';
import { IUserRepositoryForAuth } from '@/auth/infra/adaper/iUser.repository';
import { AuthService } from '../auth.service';
import { createUserId } from '@/core/common/utils/userId';
import { signupVerifyTokenCreate } from '@/core/common/utils/signupVerifyToken';
import { Role } from '@/core/common/roles/role.enum';
import { IClientRepoForAuth } from '@/auth/infra/adaper/iClient.repository';
import { CreateSocialUserDto } from '@/core/interface/dto/create-socialUser.dto';
import { CreateSocialUserDbModel } from '@/core/domain/db/create-socialUser-db.model';

@Injectable()
@CommandHandler(GoogleSocialCreateOrLoginCommand)
export class GoogleSocialCreateOrLoginHandler
  implements ICommandHandler<GoogleSocialCreateOrLoginCommand>
{
  constructor(
    @Inject('UserRepository') private readonly userRepository: IUserRepositoryForAuth,
    @Inject('ClientRepository') private readonly clientRepository: IClientRepoForAuth,
    private readonly authService: AuthService,
  ) {}

  async execute(command: GoogleSocialCreateOrLoginCommand): Promise<any> {
    const { name, email, accessToken, ip, role, clientCode } = command;
    const user = await this.userRepository.findUserByEmail(email);
    const client = await this.clientRepository.findByClientCode(clientCode);
    console.log('들어옴 2 : ', clientCode, client, user);
    if (user && user.client?.id === client?.id && user.verified && user.client.isPaid) {
      console.log('들어옴 1 : ');
      return await this.authService.login(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          clientId: user.clientId,
          isTwoFactorEnabled: user.isTwoFactorEnabled,
        },
        ip,
      );
    }
    
    if (
      !client ||
      (user && user.client.id !== client.id)
    ) {
      throw new UnauthorizedException('클라이언트 코드가 잘못되었습니다.');
    }
    else if (
      !client.isPaid || 
      (user && user.client && !user.client.isPaid)
    ) {
      throw new UnauthorizedException('결제되지 않은 사용자입니다.');
    }

    console.log('들어옴 3 : ');
    const createSocialUserDto: CreateSocialUserDto = {
      name,
      email,
    };
    const createSocialUserDbModel: CreateSocialUserDbModel = {
      id: createUserId(),
      name: createSocialUserDto.name,
      email: createSocialUserDto.email,
      signupVerifyToken: await signupVerifyTokenCreate(),
      role: Role.ClientUser,
      clientId: client.id,
      createdAt: new Date(),
      verified: true,
    };

    const afterSaveUser = await this.userRepository.createSocialUser(
        createSocialUserDbModel,
    );
    return await this.authService.login(
      {
        id: createSocialUserDbModel.id,
        name: createSocialUserDbModel.name,
        email: createSocialUserDbModel.email,
        clientId: createSocialUserDbModel.clientId,
        isTwoFactorEnabled: afterSaveUser.isTwoFactorEnabled,
      },
      ip,
    );
  }
}
