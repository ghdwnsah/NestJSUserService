import { Controller, Sse, MessageEvent, Post, Body } from '@nestjs/common';
import { Observable } from 'rxjs';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Sse('stream')
  sendEvents(): Observable<MessageEvent> {
    return this.notificationService.getSseStream();
  }

  @Post('broadcast')
  broadcast(@Body() body: { message: string }) {
    this.notificationService.broadcastSseNotification({ message: body.message });
    return { success: true };
  }
}