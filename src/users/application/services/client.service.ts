import { Injectable } from '@nestjs/common';
import { CreateClientUseCase } from '../use-cases/create-client.usecase';
import { UpdateClientUseCase } from '../use-cases/update-client.usecase';
import { DeleteClientUseCase } from '../use-cases/delete-client.usecase';
import { CreateClientDto } from '@/users/interface/dto/create-client.dto';
import { CreateUserDto } from '@/users/interface/dto/create-user.dto';

@Injectable()
export class ClientService {
  constructor(
    private readonly createClientUseCase: CreateClientUseCase,
    private readonly updateClientUseCase: UpdateClientUseCase,
    private readonly deleteClientUseCase: DeleteClientUseCase,
  ) {}

//   async createClient(
//     userName: string, userEmail: string, userPassword: string, 
//     clientName: string,
// ) {

//     return await this.createClientUseCase.execute();
//   }

  async updateClient(id: string, data: any) {
    return await this.updateClientUseCase.execute(id, data);
  }

  async deleteClient(id: string) {
    return await this.deleteClientUseCase.execute(id);
  }
}