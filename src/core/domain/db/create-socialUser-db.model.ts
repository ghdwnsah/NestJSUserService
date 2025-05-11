import { Role } from "@/core/common/roles/role.enum";
import { CreateSocialUserDto } from "@/core/interface/dto/create-socialUser.dto";

export class CreateSocialUserDbModel extends CreateSocialUserDto {
    readonly id: string;
    readonly signupVerifyToken: string;
    readonly verified: boolean;
    readonly role: Role;
    readonly clientId?: string;
    readonly createdAt?: Date;
    readonly resetPasswordToken?: string;
    readonly resetPasswordExpires?: Date;
}