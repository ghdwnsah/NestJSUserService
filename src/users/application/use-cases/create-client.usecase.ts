import { Injectable } from '@nestjs/common';
import { ClientRepository } from '@/users/infra/db/repository/client.repository';
import { CreateClientDto } from '@/users/interface/dto/create-client.dto';
import { CreateUserDto } from '@/users/interface/dto/create-user.dto';
import { ulid } from 'ulid';
import { CreateClientDbDto } from '@/users/interface/dto/create-client-db.dto';

@Injectable()
export class CreateClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(createClientDto: CreateClientDto) {
    const clientDbDto: CreateClientDbDto = {
      name: createClientDto.name,
      isPaid: false,
    }

    return await this.clientRepository.createClient(clientDbDto);
  }
}