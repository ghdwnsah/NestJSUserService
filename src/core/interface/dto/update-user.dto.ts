import { EmailField, NameField, PasswordField } from "../fields/base-user-fields";

export class UpdateUserDto {
    //----------------------------
    readonly name: NameField['name'];
    //----------------------------
    readonly email: EmailField['email'];
    //----------------------------
    // readonly password: PasswordField['password'];
}
