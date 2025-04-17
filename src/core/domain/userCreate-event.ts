import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from './cqrs-event';

// 가입 이메일 전송
export class UserCreatedEvent extends CqrsEvent implements IEvent {
  constructor(
    readonly email: string,
    readonly signupVerifyToken: string,
  ) {
    super(UserCreatedEvent.name);
  }
}