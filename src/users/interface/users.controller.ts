import { Controller, Get, Post, Body, Patch, Param, Delete, Res, BadRequestException, Query, ParseIntPipe, HttpStatus, DefaultValuePipe, Headers, UseGuards, Req, Ip, ValidationPipe } from '@nestjs/common';
import { UsersService } from '../application/services/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UserLoginDto } from './dto/login-user.dto';
import { UserInfo } from './userInfo';
import { AuthService } from '@/core/common/auth/auth.service';
import { JwtAuthGuard } from '@/core/common/auth/jwt-auth.guard';
import { User } from '@/core/common/auth/user.decorator';
import { RolesGuard } from '@/core/common/roles/roles.guard';
import { Roles } from '@/core/common/roles/roles.decorator';
import { Role } from '@/core/common/roles/role.enum';

// @UseGuards(RolesGuard)
// @Roles(Role.SuperAdmin)
@Controller('/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  // TODO : superadmin 가입 절차
  @Post()
  async create(@Body() dto: CreateUserDto) {
    const { name, email, password } = dto

    await this.usersService.testSuperAdminCreateUser(name, email, password);
  }

  

  @Post('/email-verify')
  async verifyEmail(@Query() dto: VerifyEmailDto, @Ip() ip: string): Promise<object> {
    const { signupVerifyToken } = dto;

    return await this.usersService.verifyEmail(signupVerifyToken, ip);
  }

  @Post('/login')
  async login(@Body() dto: UserLoginDto, @Ip() ip: string): Promise<object> { 
    const { email, password } = dto;

    const user = await this.usersService.validateUser(email, password);

    return await this.usersService.login(email, password, ip);
  }

  @Get()
  findAll(
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
	  @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Res() res
  ) {
    const users = this.usersService.findAll();

    return res
            .status(200)
            .send(users);
  }

  // TODO : DTO 처리 후 타입 변경
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getUserInfo(@User(
      new ValidationPipe({ validateCustomDecorators: true })
    ) user: string, @Param('id') userId: string) {
    console.log('user : ', user)
    return await this.usersService.getUserInfo(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
