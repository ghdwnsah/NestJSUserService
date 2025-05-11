import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class NotificationService {
  private sseStream$ = new Subject<MessageEvent>();

  getSseStream() {
    return this.sseStream$.asObservable();
  }

  broadcastSseNotification(data: any) {
    this.sseStream$.next(new MessageEvent('message', { data }));
  }
}