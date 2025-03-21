import { Controller, Get, Post, Body, Patch, Param, Delete, Res, BadRequestException, Query, ParseIntPipe, HttpStatus, DefaultValuePipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UserLoginDto } from './dto/login-user.dto';
import { UserInfo } from './userInfo';
import { ValidationPipe } from 'src/validation.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const { name, email, password } = dto

    await this.usersService.createUser(name, email, password);
  }

  @Post('/email-verify')
  async verifyEmail(@Query() dto: VerifyEmailDto): Promise<string> {
    const { signupVerifyToken } = dto;

    return await this.usersService.verifyEmail(signupVerifyToken);
  }

  @Post('/login')
  async login(@Body() dto: UserLoginDto): Promise<string> { 
    const { email, password } = dto;

    return await this.usersService.login(email, password);
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

  @Get('/:id')
  findOne(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number) {
    if (id < 1) {
      throw new BadRequestException('id는 0보다 큰 값이어야 합니다.');
    }

    return this.usersService.findOne(id);
  }

  @Get('/:userId')
  async getUserInfo(@Param('userId') userId: string) {
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
