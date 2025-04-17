import { Module } from "@nestjs/common";
import { CreateClientAdminUseCase } from "./create-clientadmin.usecase";
import { NodemailerEmailService } from "@/email/infra/nodemailer-email.service";
import { ClientAdminsRepository } from "@/client-admins/infra/db/client-admins.repository";
import { PrismaModule } from "@/core/infra/db/prisma.module";
import { UserRepository } from "@/core/infra/db/repo/user.repository.impl";

@Module({
    imports: [
        // inside

        // outside

        //core
        PrismaModule
    ],
    controllers: [],
    providers: [
        // inside
        CreateClientAdminUseCase,

        // outside
        NodemailerEmailService,

        //core
        ClientAdminsRepository,
        UserRepository,
    ],
    exports: [
        CreateClientAdminUseCase,
    ]
})
export class ClientAdminsUsecaseModule {}