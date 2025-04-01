import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../infra/db/repository/user.repository';

@Injectable()
export class GetUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string) {
    return await this.userRepository.getUserById(id);
  }

  async getAll() {
    return await this.userRepository.getAllUsers();
  }
}