import { Module, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmailModule } from 'src/email/email.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [EmailModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})
export class UsersModule {}
