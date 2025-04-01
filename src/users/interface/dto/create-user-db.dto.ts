import { Role } from "@/core/common/roles/role.enum";
import { CreateUserDto } from "./create-user.dto";

export class CreateUserDbDto extends CreateUserDto {
    readonly id: string;
    readonly signupVerifyToken: string;
    readonly verified: boolean;
    readonly role: Role;
}