import { IsNotEmpty } from "class-validator";
import { CreateClientDtoInterface } from "./create-client.dto";
import { CreateUserDto } from "../../../core/interface/dto/create-user.dto";

export class CreateClientAdminDto extends CreateUserDto implements CreateClientDtoInterface {
    @IsNotEmpty({ message: '클라이언트 이름은 필수입니다.' })
    clientName: string;
}