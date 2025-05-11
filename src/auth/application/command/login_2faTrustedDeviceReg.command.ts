import { ICommand } from '@nestjs/cqrs';

export class Login2faTrustedDeviceRegCommand implements ICommand {
    constructor(
        public readonly email: string,
        public readonly otp: string,
        public readonly ip: string,
        public readonly userAgent: string,
        public readonly deviceName?: string,
    ) { }
}