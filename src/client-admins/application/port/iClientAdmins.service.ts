import { CreateClientAdminUserResponse } from "@/client-admins/interface/response/createClientAdminUser.response";
import { User } from "@prisma/client";

export interface iClientAdminsServiceForClientAdmins {
    createClientAdmin: ( name: string, email: string, password: string, clientName: string) => Promise<CreateClientAdminUserResponse>;
    findAll: (offset: number, limit: number) => Promise<User[]>
    deleteUser: (id: string) => Promise<User>
    updateUser: (id: string, updateData: any) => Promise<User>
    resetPassword: (id: string) => Promise<{ message: string }>
}