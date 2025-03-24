import * as uuid from 'uuid';

import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { EmailService } from 'src/email/email.service';
import { UserInfo } from './userInfo';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private emailService: EmailService,
    private prisma: PrismaService,
  ) {}


  async createUser(name: string, email: string, password: string) {
    await this.checkUserExists(email);  // 이메일 기반 중복 유저

    const signupVerifyToken = uuid.v1();

    await this.saveUser(name, email, password, signupVerifyToken);

    return 'This action adds a new user';
  }

  private async checkUserExists(email: string) {
    const exists = await this.prisma.user.findFirst({ where: { email } });
    if (exists) throw new ConflictException('User already exists');

    return false; // TODO: DB 연동 후 구현
  }

  private saveUser(name: string, email: string, password: string, signupVerifyToken: string){


    return; // TODO: DB 연동 후 구현
  }

  private async sendMemberJoinEmail(email: string, signupVerifyToken: string){
    await this.emailService.sendMemberJoinVerification(email, signupVerifyToken);
  }



  async verifyEmail(signupVerifyToken: string): Promise<string> {
    //TODO
    //1. DB에서 signupVerifyToken으로 회원 가입 처리중인 유저가 있는지 조회하고 없다면 에러 처리
    //2. 바로 로그인 상태가 되도록 JWT를 발급

    throw new Error('Method not implemented');
  }



  async login(email: string, password: string) {
    return 'test';
  }

  async getUserInfo(userId: string): Promise<UserInfo> {
    // TODO
    // 1. userId를 가진 유저가 존재하는지 DB에서 확인하고 없다면 에러 처리
    // 2. 조회된 데이터를 UserInfo 타입으도 응답

    throw new Error('Method not implemented.');
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
