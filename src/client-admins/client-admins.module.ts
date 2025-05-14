import { Logger, MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { ClientAdminsController } from "./interface/client-admins.controller";
import { PrismaModule } from "@/core/infra/db/prisma.module";
import { ClientAdminsRepository } from "./infra/db/client-admins.repository";
import { UserRepository } from "@/core/infra/db/repo/user.repository.impl";
import { CqrsModule } from "@nestjs/cqrs";
import { CreateClientAdminUserHandler } from "./application/command/create-clientadmin.handler";
import { NodemailerEmailService } from "@/email/infra/nodemailer-email.service";
import { UserEventsHandler } from "@/core/application/event/users-event.handler";
import { GetClientUserInfoHandler } from "./application/query/get-clientUserInfo.handler";
import { PaidClientCheckPipe } from "@/core/infra/pipe/paidClientCheck.pipe";
import { ClientRepository } from "@/core/infra/db/repo/client.repository";
import { AccessTokenMiddleware } from "@/shared/middleware/access-token.middleware";
import { TenantModule } from "@/tenant/tenant.module";
import { TenantMiddleware } from "@/tenant/tenant.middleware";
import { TenantUserRepository } from "@/core/infra/db/repo/tenant-user.repository";


@Module({
    imports: [
        // inside

        // outside
        CqrsModule,
        TenantModule,

        // core
        PrismaModule,
    ],
    controllers: [ClientAdminsController],
    providers: [
        // inside
        ClientAdminsRepository,
        CreateClientAdminUserHandler,
        GetClientUserInfoHandler,

        // outside
        NodemailerEmailService,
        Logger,

        // core
        {provide: 'UserRepository', useClass: UserRepository},
        {provide: 'ClientRepository', useClass: ClientRepository},
        TenantUserRepository,
        UserEventsHandler,
        PaidClientCheckPipe,
    ],
    exports: []
})
export class ClientAdminsModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
          .apply(AccessTokenMiddleware)
          .forRoutes('*');
      }
}