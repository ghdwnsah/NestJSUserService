import { Module } from "@nestjs/common";
import { UserRepository } from "./infra/db/repo/user.repository.impl";
import { ClientRepository } from "./infra/db/repo/client.repository";
import { TenantModule } from "@/tenant/tenant.module";

@Module({
    imports: [TenantModule],
    controllers: [],
    providers: [
        {provide: 'UserRepository', useClass: UserRepository},
        {provide: 'ClientRepository', useClass: ClientRepository},
    ],
    exports: [],
})
export class CoreModule {}