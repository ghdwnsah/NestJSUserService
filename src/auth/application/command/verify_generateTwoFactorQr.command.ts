import { ICommand } from "@nestjs/cqrs";

export class VerifyGenerateTwoFactorQrCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly isTwoFactorEnabled: boolean,
  ) {}
}