import { Module } from "@nestjs/common";
import { NotificationController } from "./notification.controller";
import { NotificationGateway } from "./notification.gateway";
import { NotificationService } from "./notification.service";
import { ChatGateway } from "./chat.gateway";

@Module({
    imports: [],
    controllers: [NotificationController],
    providers: [NotificationGateway, NotificationService, ChatGateway],
    exports: [],
})
export class NotificationModule {}