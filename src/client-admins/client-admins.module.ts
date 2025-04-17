import { Module } from "@nestjs/common";
import { ClientAdminsController } from "./interface/client-admins.controller";
import { ClientAdminsService } from "./application/client-admins.service";
import { ClientAdminsUsecaseModule } from "./application/usecase/clientAdminsUsecase.module";
import { PrismaModule } from "@/core/infra/db/prisma.module";
import { ClientAdminsRepository } from "./infra/db/client-admins.repository";
import { UserRepository } from "@/core/infra/db/repo/user.repository.impl";
import { CqrsModule } from "@nestjs/cqrs";
import { CreateUserHandler } from "./application/command/create-clientadmin.handler";
import { NodemailerEmailService } from "@/email/infra/nodemailer-email.service";
import { UserEventsHandler } from "@/core/application/event/users-event.handler";

@Module({
    imports: [
        // inside
        ClientAdminsUsecaseModule,

        // outside
        CqrsModule,

        // core
        PrismaModule,
    ],
    controllers: [ClientAdminsController],
    providers: [
        // inside
        ClientAdminsRepository,
        ClientAdminsService,
        CreateUserHandler,

        // outside
        NodemailerEmailService,

        // core
        UserRepository,
        UserEventsHandler,
    ],
    exports: []
})
export class ClientAdminsModule {}