import { IsNotEmpty } from "class-validator";
import { UpdateClientDtoInterface } from "../../../core/interface/dto/update-client.dto";
import { CreateUserDto } from "../../../core/interface/dto/create-user.dto";
import { ApiProperty } from "@nestjs/swagger";
import { EXAMPLES } from "@/shared/swagger/example";

export class CreateClientAdminUserDto extends CreateUserDto implements UpdateClientDtoInterface {
    @ApiProperty({ example: EXAMPLES.client.name.value, description: EXAMPLES.client.name.desc })
    @IsNotEmpty({ message: '클라이언트 이름은 필수입니다.' })
    clientName: string;
}