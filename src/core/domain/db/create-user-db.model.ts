import { Role } from "@/core/common/roles/role.enum";
import { CreateUserDto } from "@/core/interface/dto/create-user.dto";

export class CreateUserDbModel extends CreateUserDto {
    readonly id: string;
    readonly signupVerifyToken: string;
    readonly verified: boolean;
    readonly role: Role;
    readonly clientId?: string;
    readonly createdAt?: Date;
    readonly resetPasswordToken?: string;
    readonly resetPasswordExpires?: Date;
}


