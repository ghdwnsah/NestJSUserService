import { Controller, Get, HostParam, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller({ host: ':version.api.localhost' })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  index(@HostParam('version') version: string): string {
    return `Hello, API Version ${version}`;
  }
}
