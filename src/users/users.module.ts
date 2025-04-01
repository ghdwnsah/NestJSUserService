import { Module, Req } from '@nestjs/common';
import { UsersService } from './application/services/users.service';
import { UsersController } from './interface/users.controller';
import { EmailModule } from 'src/email/email.module';
import { PrismaService } from '@/core/infra/db/prisma.service';
import { AuthService } from '@/core/common/auth/auth.service';
import { AuthModule } from '@/core/common/auth/auth.module';
import { PrismaModule } from '@/core/infra/db/prisma.module';
import { ClientsController } from './interface/controllers/clients.controller';
import { ClientController } from './interface/controllers/client.controller';
import { UserRepository } from './infra/db/repository/user.repository';
import { ClientRepository } from './infra/db/repository/client.repository';
import { ClientsService } from './application/services/clients.service';
import { CreateUserUseCase } from './application/use-cases/create-user.usecase';
import { CreateClientUseCase } from './application/use-cases/create-client.usecase';
import { UpdateClientUseCase } from './application/use-cases/update-client.usecase';
import { DeleteClientUseCase } from './application/use-cases/delete-client.usecase';

@Module({
  imports: [EmailModule, AuthModule, PrismaModule],
  controllers: [
    UsersController, 
    ClientsController,
    ClientController,
  ],
  providers: [
    UsersService,
    ClientsService,
    UserRepository,
    ClientRepository,

    CreateUserUseCase,
    CreateClientUseCase,
    UpdateClientUseCase,
    DeleteClientUseCase,
  ],
})
export class UsersModule {}