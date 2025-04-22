import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NodemailerEmailService } from '@/email/infra/nodemailer-email.service';
import { UserCreatedEvent } from '@/core/domain/userCreate-event';
import { TestEvent } from '@/core/domain/test-event';
import { Inject } from '@nestjs/common';
import { ResetPasswordEvent } from '@/core/domain/resetPassword-event';

@EventsHandler(UserCreatedEvent, ResetPasswordEvent)
export class UserEventsHandler implements IEventHandler<UserCreatedEvent | ResetPasswordEvent> {
    constructor(
        private nodemailerEmailService: NodemailerEmailService,
    ) {}

    async handle(event: UserCreatedEvent | ResetPasswordEvent ) {
        switch (event.name) {
            case UserCreatedEvent.name: {
                const { email, signupVerifyToken } = event as UserCreatedEvent;
                await this.nodemailerEmailService.sendMemberJoinVerification(email, signupVerifyToken);
                break;
            }
            case ResetPasswordEvent.name: {
                const { email, url } = event as ResetPasswordEvent;
                console.log(url);
                await this.nodemailerEmailService.sendResetPasswordEmail(email, url);
                break;
            }
            default:
                break;
        }
    }
}