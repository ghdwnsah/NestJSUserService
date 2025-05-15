import { AccessTokenMiddleware } from "@/shared/middleware/access-token.middleware";
import { Logger, MiddlewareConsumer, Module } from "@nestjs/common";
import { ClientUsersController } from "./interface/client-users.controller";
import { CreateClientUserHandler } from "./application/command/create-clientUser.handler";
import { ClientRepository } from "@/core/infra/db/repo/client.repository";
import { TenantUserRepository } from "@/core/infra/db/repo/tenant-user.repository";
import { CqrsModule } from "@nestjs/cqrs";
import { PrismaService } from "@/core/infra/db/prisma.service";
import { UserRepository } from "@/core/infra/db/repo/user.repository.impl";
import { TenantModule } from "@/tenant/tenant.module";

@Module({
    imports: [
        // inside

        // outside
        TenantModule,
        CqrsModule,

        // core
    ],
    controllers: [
        // inside
        ClientUsersController,

        // outside

        // core
    ],
    providers: [
        // inside
        CreateClientUserHandler,

        // outside
        Logger,

        // core
        {provide: 'ClientRepository', useClass: ClientRepository},
        {provide: 'UserRepository', useClass: UserRepository},
        TenantUserRepository,
        PrismaService,
    ],
    exports: [
        // inside

        // outside

        // core
    ]
})

export class ClientUsersModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
          .apply(AccessTokenMiddleware)
          .forRoutes('*');
      }
}