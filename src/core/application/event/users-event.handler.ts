import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NodemailerEmailService } from '@/email/infra/nodemailer-email.service';
import { UserCreatedEvent } from '@/core/domain/userCreate-event';
import { TestEvent } from '@/core/domain/test-event';

@EventsHandler(UserCreatedEvent, TestEvent)
export class UserEventsHandler implements IEventHandler<UserCreatedEvent | TestEvent> {
    constructor(
        private nodemailerEmailService: NodemailerEmailService,
    ) {}

    async handle(event: UserCreatedEvent | TestEvent) {
        switch (event.name) {
            case UserCreatedEvent.name: {
                console.log('UserCreatedEvent!');
                console.log('UserCreatedEvent.name : ', UserCreatedEvent.name);
                const { email, signupVerifyToken } = event as UserCreatedEvent;; //TODO: any 임시 처리

                await this.nodemailerEmailService.sendMemberJoinVerification(email, signupVerifyToken);
                break;
            }
            case TestEvent.name: {
                console.log('TestEvent!');
                break;
            }
            default:
                break;
        }
    }
}