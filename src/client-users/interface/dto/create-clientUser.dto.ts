import { UpdateClientUserDtoInterface } from "@/core/interface/dto/update-client.dto";
import { CreateUserDto } from "@/core/interface/dto/create-user.dto";
import { EXAMPLES } from "@/shared/swagger/example";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateClientUserDto extends CreateUserDto implements UpdateClientUserDtoInterface {
    @ApiProperty({ example: EXAMPLES.client.code.value, description: EXAMPLES.client.code.desc })
    @IsNotEmpty({ message: '클라이언트 코드는 필수입니다.' })
    clientCode: string;
}