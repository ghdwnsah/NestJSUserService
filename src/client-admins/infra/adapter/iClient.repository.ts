import { Client } from "@prisma/client";

export interface iClientRepositoryForClientAdmins {
    updateClient(id: string, data: any): Promise<Client>
}