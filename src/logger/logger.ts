import { ConsoleLogger, Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class CustomLogger extends ConsoleLogger implements LoggerService {
    log(message: any, ...optionalParams: any[]) {
        console.log(message);
    }
    error(message: any, ... optionalParams: any[]){
        console.log(message);
    };
	warn(message: any, ... optionalParams: any[]){
        console.log(message);
    };
	debug (message: any, ... optionalParams: any[]){
        console.log(message);
    };
	verbose(message: any, ... optionalParams: any[]){
        console.log(message);
    };
}
