import { UserRepository } from "@/core/infra/db/repo/user.repository.impl";
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