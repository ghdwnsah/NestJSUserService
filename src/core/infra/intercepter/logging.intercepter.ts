import { CallHandler, ExecutionContext, Inject, Injectable, Logger, LoggerService, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
	const {method, url, body,} = context.getArgByIndex(0);
    this.logger.debug(`Request to ${method} ${url} \n request: ${JSON.stringify(body)}`);
    this.logger.verbose('Before...');

    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(()=> this.logger.verbose(`After... ${Date.now() - now}ms`)),
        tap(data => this.logger.debug(`Request to ${method} ${url} \n response: ${JSON.stringify(data)}`)),
      );
  }
}
