import { Role } from "@/core/common/roles/role.enum";

class ClientInfo {
    name: string;
    clientCode: string;
}

export class GetClientUserInfoQueryResponse {
    id: string;
    name: string;
    email: string;
    verified: boolean;
    createdAt: Date;
    role: Role;
    client: ClientInfo;
}