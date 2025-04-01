import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../infra/db/repository/user.repository';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string) {
    return await this.userRepository.deleteUser(id);
  }
}