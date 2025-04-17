import { UpdateUserDto } from "@/core/interface/dto/update-user.dto";
import { PasswordField } from "@/core/interface/fields/base-user-fields";

export class UpdateClientUserDto extends UpdateUserDto {
    readonly password: PasswordField['password'];
}
