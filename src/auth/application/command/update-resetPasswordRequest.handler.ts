import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { UpdateResetPasswordRequestCommand } from "./update-resetPasswordRequest.command";

import { v4 as uuidv4 } from 'uuid';
import { addMinutes } from "date-fns";
import { ClientAdminsRepository } from "@/client-admins/infra/db/client-admins.repository";
import { ResetPasswordEvent } from "@/core/domain/resetPassword-event";
import { iUserRepositoryForClientAdmins } from "@/client-admins/infra/adapter/iUser.repository";

@Injectable()
@CommandHandler(UpdateResetPasswordRequestCommand)
export class UpdateResetPasswordRequestHandler implements ICommandHandler<UpdateResetPasswordRequestCommand> {
    constructor (
        @Inject('UserRepository') private readonly userRepository: iUserRepositoryForClientAdmins,
        private readonly eventBus: EventBus,
    ) {}

    async execute(command: UpdateResetPasswordRequestCommand): Promise<any> {
        const {id, email} = command;
        if (!id && !email) {
            throw new BadRequestException('id 또는 email 중 하나는 필수입니다.');
        }

        const user = id
        ? await this.userRepository.getUserByIdForClientAdmin(id)
        : await this.userRepository.getUserByEmailForClientAdmin(email);

        if (!user) throw new BadRequestException('유저가 존재하지 않습니다.');

        const resetToken = uuidv4();
        const expiresAt = addMinutes(new Date(), 30); // 30분 후 만료

        await this.userRepository.updateUser(user.id, {
            resetPasswordToken: resetToken,
            resetPasswordExpires: expiresAt,
        });

        const baseUrl = 'http://localhost:3000/users/auth'; // 👉 프론트엔드 페이지 주소
        const url = `${baseUrl}/reset-password/page?token=${resetToken}`;

        this.eventBus.publish(new ResetPasswordEvent(user.email, url));

        return { message: "비밀번호 재설정 링크가 이메일로 발송되었습니다." };
    }
}