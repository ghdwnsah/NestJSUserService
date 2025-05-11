import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';
import { PrismaHealthIndicator } from '../application/prisma.health-indicator';

@Controller('health-check')
export class HealthCheckController {
    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
        private prisma: PrismaHealthIndicator,
    ) {}

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            () => this.http.pingCheck('naver', 'https://www.naver.com'),
            () => this.http.pingCheck('google', 'https://google.com'),
            () => this.prisma.isHealthy('prisma'),
        ]);
    }
}