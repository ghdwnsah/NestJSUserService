import { Module } from '@nestjs/common';
import { EmailController } from './interface/controllers/email.controller';
// import { VerifyEmailUseCase } from './application/usecase/verifyEmail.usecase';

@Module({
    controllers: [
        EmailController,
    ],
    providers: [
    ],
    exports: [

    ],
})
export class EmailModule {}
