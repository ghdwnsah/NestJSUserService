import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Inject, InternalServerErrorException, Logger, LoggerService } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(
        @Inject(Logger) private readonly logger: LoggerService,
        // private readonly logger: Logger,
    ) {}

  catch(exception: unknown, host: ArgumentsHost) {
  const ctx = host.switchToHttp();
  const res = ctx.getResponse<Response>();
  const req = ctx.getRequest<Request>();

  let status = 500;
  let responseBody: any = { message: 'Internal Server Error' };
  let stack = (exception as any)?.stack;

  if (exception instanceof HttpException) {
    status = exception.getStatus();
    responseBody = exception.getResponse();
  } else {
    this.logger.error('Unexpected error', stack);
  }

  const locationLine = stack?.split('\n')[1]?.trim();

  this.logger.error(
    `\n[${req.method}] ${req.url} - ${status}\n` +
    `❗Message: ${JSON.stringify(responseBody)}\n` +
    `❗Location: ${locationLine}\n` +
    `❗Stack:\n${stack}`
  );

  res.status(status).json(responseBody);
}
}