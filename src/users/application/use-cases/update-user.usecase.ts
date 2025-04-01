import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../infra/db/repository/user.repository';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string, data: any) {
    return await this.userRepository.updateUser(id, data);
  }
}