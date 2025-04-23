import { EXAMPLES } from "@/shared/swagger/example";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordRequestDto {
    @ApiProperty({ example: EXAMPLES.user.id.value, description: EXAMPLES.user.id.desc })
    id: string;
}