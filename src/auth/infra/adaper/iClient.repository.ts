import { Client } from "@prisma/client"

export interface IClientRepoForAuth {
    isClientPaidByUserInfo(userId: string): Promise<Boolean>
    findByClientCode(clientCode: string): Promise<Client | null>
}