import { CreateClientAdminUserResponse } from "@/client-admins/interface/reponse/createClientAdminUser.response";
import { CreateClientDto } from "@/core/interface/dto/create-client.dto";
import { CreateUserDto } from "@/core/interface/dto/create-user.dto";
import { Inject, Injectable } from "@nestjs/common";
import { CreateClientAdminUseCase } from "./usecase/create-clientadmin.usecase";

@Injectable()
export class ClientAdminsService {
    constructor(
        private readonly createClientAdminUseCase: CreateClientAdminUseCase,
        // private readonly createClientAdminUseCase: ICreateClientAdminUseCaseForClientAdmins,
        // private readonly getAllUsersAdminOnlyUseCase: IGetFindAllUsersUseCaseForClientAdmins,
        // private readonly updateUserAdminOnlyUseCase: IUpdateClientUserUseCaseForClientAdmins,
        // private readonly updateResetPasswordClientUserAdminOnlyUseCase: IUpdateResetPasswordClientUserUseCaseForClientAdmins,
        // private readonly deleteUserUseCase: IDeleteUserUseCaseForClientAdmins,
    ) {}

    async createClientAdmin(name: string, email: string, password: string, clientName: string,): Promise<CreateClientAdminUserResponse> {
        const createUserDto: CreateUserDto = {
            name,
            email,
            password,
        };
        const createClientDto: CreateClientDto = {
            name: clientName,
        };
    
        return await this.createClientAdminUseCase.execute(createUserDto, createClientDto);
    }

    // async findAll(offset: number, limit: number): Promise<User[]> {
    //     return await this.getAllUsersAdminOnlyUseCase.execute(offset, limit);
    // }

    // async deleteUser(id: string): Promise<User> {
    //     return await this.deleteUserUseCase.execute(id);
    // }
    // async updateUser(id: string, updateData: any): Promise<User> {
    //     return await this.updateUserAdminOnlyUseCase.execute(id, updateData);
    // }

    // async resetPassword(id: string): Promise<{ message: string }> {
    //     return await this.updateResetPasswordClientUserAdminOnlyUseCase.execute(id);
    // }
}