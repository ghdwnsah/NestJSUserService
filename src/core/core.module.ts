import { Module } from "@nestjs/common";
import { UserRepository } from "./infra/db/repo/user.repository.impl";
import { ClientRepository } from "./infra/db/repo/client.repository";

@Module({
    imports: [],
    controllers: [],
    providers: [
        {provide: 'UserRepository', useClass: UserRepository},
        {provide: 'ClientRepository', useClass: ClientRepository},
    ],
    exports: [],
})
export class CoreModule {}