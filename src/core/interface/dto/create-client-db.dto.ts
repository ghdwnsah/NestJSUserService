import { CreateClientDto } from "./create-client.dto";

export class CreateClientDbDto extends CreateClientDto {
    id?: string
    isPaid: boolean
    clientCode: string
}