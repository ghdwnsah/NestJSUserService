import { Injectable } from '@nestjs/common';
import { CreateClientUseCase } from '../use-cases/create-client.usecase';
import { UpdateClientUseCase } from '../use-cases/update-client.usecase';
import { DeleteClientUseCase } from '../use-cases/delete-client.usecase';
import { CreateClientDto } from '@/users/interface/dto/create-client.dto';
import { CreateUserDto } from '@/users/interface/dto/create-user.dto';
import { CreateUserUseCase } from '../use-cases/create-user.usecase';
import { Role } from '@/core/common/roles/role.enum';

@Injectable()
export class ClientsService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly createClientUseCase: CreateClientUseCase,
    private readonly updateClientUseCase: UpdateClientUseCase,
    private readonly deleteClientUseCase: DeleteClientUseCase,
  ) {}

  async createClient(
    userName: string, userEmail: string, userPassword: string, 
    clientName: string,
) {
    const createUserDto: CreateUserDto = {
        name: userName,
        email: userEmail,
        password: userPassword,
    }
    const createClientDto: CreateClientDto = {
        name: clientName,
    }
    const role: Role = Role.ClientAdmin;

    await this.createUserUseCase.execute(createUserDto, role);
    return await this.createClientUseCase.execute(createClientDto);
  }

  async updateClient(id: string, data: any) {
    return await this.updateClientUseCase.execute(id, data);
  }

  async deleteClient(id: string) {
    return await this.deleteClientUseCase.execute(id);
  }
}