import * as uuid from 'uuid';
import * as bcrypt from 'bcrypt';

import { ConflictException, Injectable, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../../interface/dto/create-user.dto';
import { UpdateUserDto } from '../../interface/dto/update-user.dto';
import { VerifyEmailDto } from '../../interface/dto/verify-email.dto';
import { EmailService } from 'src/email/email.service';
import { UserInfo } from '../../interface/userInfo';
import { PrismaService } from '@/core/infra/db/prisma.service';
import { AuthService } from '@/core/common/auth/auth.service';
import { ulid } from 'ulid';
import { userInfo } from 'os';
import { UserLoginDto } from '../../interface/dto/login-user.dto';
import { CreateUserUseCase } from '../use-cases/create-user.usecase';
import { Role } from '@/core/common/roles/role.enum';

@Injectable()
export class UsersService {
  constructor(
    private authService: AuthService,
    private prismaService: PrismaService,
    private CreateUserUseCase: CreateUserUseCase,
  ) {}


  async testSuperAdminCreateUser(name: string, email: string, password: string) {
    console.log('testSuperAdminCreateUser()');
    let createUserDto: CreateUserDto = {
      name,
      email,
      password,
    }

    return await this.CreateUserUseCase.execute(createUserDto, Role.SuperAdmin);
  }

  async verifyEmail(signupVerifyToken: string, ip: string): Promise<object> {
    const user = await this.prismaService.user.findFirst({ where: { signupVerifyToken } });
    if (!user) throw new NotFoundException('유저가 존재하지 않습니다.');
    if (user.verified) throw new NotAcceptableException('이미 가입이 완료된 유저입니다.');

    await this.prismaService.user.update({
      where: { email: user.email },
      data: { verified: true },
    });
  
    return this.authService.login({
      id: user.id,
      name: user.name,
      email: user.email,
    }, ip);
  }// TODO: 테스트



  async login(email: string, password: string, ip: string) {
    const user = await this.validateUser(email, password);
    return this.authService.login({
      id: user.id,
      name: user.name,
      email: user.email,
    }, ip);
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.prismaService.user.findUnique({ where: { email } });
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!user || !isPasswordValid) throw new UnauthorizedException('아이디나 비밀번호가 틀렸습니다.');       
      else if (!user.verified) throw new UnauthorizedException('이메일 인증이 아직 끝나지 않았습니다.');
      
      return user;
    } catch (e) {
      throw new UnauthorizedException('아이디나 비밀번호가 틀렸습니다.');
    }
  }

  async getUserInfo(userId: string): Promise<UserInfo> {
    const user = await this.prismaService.user.findFirst({ where: { id: userId } });
    if (!user) throw new NotFoundException('유저가 존재하지 않습니다.');

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
