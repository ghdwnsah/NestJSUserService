import { ICommand } from "@nestjs/cqrs";

export class VerifyTwoFactorOtpCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly otp: string,
    public readonly ip: string,
    public readonly userAgent: string,
  ) {}
}