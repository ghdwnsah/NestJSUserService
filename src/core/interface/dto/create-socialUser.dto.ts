import { ApiProperty } from "@nestjs/swagger";
import { EmailField, NameField } from "../fields/base-user-fields";
import { EXAMPLES } from "@/shared/swagger/example";

export class CreateSocialUserDto {
    //----------------------------
    @ApiProperty({ example: EXAMPLES.user.name.value, description: EXAMPLES.user.name.desc })
    readonly name: NameField['name'];
    //----------------------------
    @ApiProperty({ example: EXAMPLES.user.email.value, description: EXAMPLES.user.email.desc })
    readonly email: EmailField['email'];
}
