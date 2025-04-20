import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NodemailerEmailService } from '@/email/infra/nodemailer-email.service';
import { UserCreatedEvent } from '@/core/domain/userCreate-event';
import { TestEvent } from '@/core/domain/test-event';
import { Inject } from '@nestjs/common';

@EventsHandler(UserCreatedEvent, TestEvent)
export class UserEventsHandler implements IEventHandler<UserCreatedEvent | TestEvent> {
    constructor(
        private nodemailerEmailService: NodemailerEmailService,
    ) {}

    async handle(event: UserCreatedEvent | TestEvent ) {
        switch (event.name) {
            case UserCreatedEvent.name: {
                const { email, signupVerifyToken } = event as UserCreatedEvent;
                await this.nodemailerEmailService.sendMemberJoinVerification(email, signupVerifyToken);
                break;
            }
            default:
                break;
        }
    }
}