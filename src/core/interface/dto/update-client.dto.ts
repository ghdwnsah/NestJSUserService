import { IsNotEmpty } from "class-validator";

export class UpdateClientDto {
    @IsNotEmpty({ message: '클라이언트 이름은 필수입니다.' })
    name: string;
}

export interface UpdateClientDtoInterface {
    // ! 사용시 위 IsNotEmpty 가져다가 쓰기
    clientName: string;
}

export interface UpdateClientUserDtoInterface {
    clientCode: string;
}