import * as uuid from 'uuid';
import * as bcrypt from 'bcrypt';

import { ConflictException, Injectable, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { EmailService } from 'src/email/email.service';
import { UserInfo } from './userInfo';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { ulid } from 'ulid';
import { userInfo } from 'os';
import { UserLoginDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private authService: AuthService,
    private emailService: EmailService,
    private prisma: PrismaService,
  ) {}


  async createUser(name: string, email: string, password: string) {
    await this.checkUserExists(email);  // 이메일 기반 중복 유저

    const hashedPassword = await bcrypt.hash(password, 10);
    const signupVerifyToken = uuid.v1();

    await this.saveUser(name, email, hashedPassword, signupVerifyToken);
    await this.sendMemberJoinEmail(email, signupVerifyToken);
  }

  private async checkUserExists(email: string) {
    const exists = await this.prisma.user.findFirst({ where: { email } });
    if (exists) throw new ConflictException('User already exists');

    return false;
  }

  private async saveUser(name: string, email: string, hashedPassword: string, signupVerifyToken: string){
    await this.prisma.user.create({
      data: {
        id: ulid(),
        name,
        email,
        password: hashedPassword,
        signupVerifyToken,
        verified: false,
      },
    });
  }

  private async sendMemberJoinEmail(email: string, signupVerifyToken: string){
    await this.emailService.sendMemberJoinVerification(email, signupVerifyToken);
  }



  async verifyEmail(signupVerifyToken: string, ip: string): Promise<object> {
    const user = await this.prisma.user.findFirst({ where: { signupVerifyToken } });
    if (!user) throw new NotFoundException('유저가 존재하지 않습니다.');
    if (user.verified) throw new NotAcceptableException('이미 가입이 완료된 유저입니다.');

    await this.prisma.user.update({
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
      const user = await this.prisma.user.findUnique({ where: { email } });
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!user || !isPasswordValid) throw new UnauthorizedException('아이디나 비밀번호가 틀렸습니다.');       
      else if (!user.verified) throw new UnauthorizedException('이메일 인증이 아직 끝나지 않았습니다.');
      
      return user;
    } catch (e) {
      throw new UnauthorizedException('아이디나 비밀번호가 틀렸습니다.');
    }
  }

  async getUserInfo(userId: string): Promise<UserInfo> {
    const user = await this.prisma.user.findFirst({ where: { id: userId } });
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
