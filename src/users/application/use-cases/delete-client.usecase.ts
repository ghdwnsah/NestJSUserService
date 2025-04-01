import { Injectable } from '@nestjs/common';
import { ClientRepository } from '@/users/infra/db/repository/client.repository';

@Injectable()
export class DeleteClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(id: string) {
    return await this.clientRepository.deleteClient(id);
  }
}