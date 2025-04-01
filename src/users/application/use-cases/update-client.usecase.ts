import { Injectable } from '@nestjs/common';
import { ClientRepository } from '@/users/infra/db/repository/client.repository';

@Injectable()
export class UpdateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(id: string, data: any) {
    return await this.clientRepository.updateClient(id, data);
  }
}