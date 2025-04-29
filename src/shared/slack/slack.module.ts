import { Global, Logger, Module } from "@nestjs/common";
import { SlackService } from "./slack.service";

@Global()
@Module({
    imports: [],
    providers: [
        Logger,
        SlackService,
    ],
    exports: [],
})
export class SlackModule {}