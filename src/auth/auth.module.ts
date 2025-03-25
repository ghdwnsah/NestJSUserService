import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import authConfig from 'src/config/authConfig';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule.forFeature(authConfig)],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {
}
