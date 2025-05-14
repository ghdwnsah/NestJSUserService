import { UpdateClientDto } from "./update-client.dto";

export class UpdateClientDbDto extends UpdateClientDto {
    id?: string
    dbUrl: string
    dbName: string
    // isPaid: boolean
    // clientCode: string
}