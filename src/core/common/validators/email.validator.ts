import { UserRepository } from '@/users/infra/db/repository/user.repository';
import { BadRequestException } from '@nestjs/common';

export async function checkEmailExists(
  email: string,
  userRepository: UserRepository,
) {
  console.log('checkEmailExists()');
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw new BadRequestException('이미 사용 중인 이메일입니다.');
  }
}