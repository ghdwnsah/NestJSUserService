import { IsNotEmpty } from "class-validator";
import { CreateClientDtoInterface } from "../../../core/interface/dto/create-client.dto";
import { CreateUserDto } from "../../../core/interface/dto/create-user.dto";
import { ApiProperty } from "@nestjs/swagger";
import { EXAMPLES } from "@/shared/swagger/example";

export class CreateClientAdminUserDto extends CreateUserDto implements CreateClientDtoInterface {
    @ApiProperty({ example: EXAMPLES.client.name.value, description: EXAMPLES.client.name.desc })
    @IsNotEmpty({ message: '클라이언트 이름은 필수입니다.' })
    clientName: string;
}