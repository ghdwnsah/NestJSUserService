import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateClientAdminUserCommand } from './create-clientadmin.command';
import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { CreateUserDto } from '@/core/interface/dto/create-user.dto';
import { UpdateClientDto } from '@/core/interface/dto/update-client.dto';
import { CreateUserDbModel } from '@/core/domain/db/create-user-db.model';

import { ulid } from 'ulid';
import { hashPassword } from '@/core/common/utils/hashPassword';
import { signupVerifyTokenCreate } from '@/core/common/utils/signupVerifyToken';
import { Role } from '@/core/common/roles/role.enum';
import { UpdateClientDbDto } from '@/core/interface/dto/update-client-db.dto';
import { NodemailerEmailService } from '@/email/infra/nodemailer-email.service';
import { ClientAdminsRepository } from '@/client-admins/infra/db/client-admins.repository';
import { UserCreatedEvent } from '@/core/domain/userCreate-event';
import { ConfigService } from '@nestjs/config';
import { TenantUserRepository } from '@/core/infra/db/repo/tenant-user.repository';
import { TenantPrismaService } from '@/tenant/tenant-client.manager';
import { cli } from 'winston/lib/winston/config';
import { spawn } from 'child_process';
import * as path from 'path';
import { PrismaService } from '@/core/infra/db/prisma.service';
import { errorResponseClientBadRequest } from '@/shared/exceptions/http-exceptions';
import { ClientRepository } from '@/core/infra/db/repo/client.repository';
import { iClientRepositoryForClientAdmins } from '@/client-admins/infra/adapter/iClient.repository';
import { iUserRepositoryForClientAdmins } from '@/client-admins/infra/adapter/iUser.repository';
import { encryptClientCode } from '@/core/common/utils/crypto';
import { error } from 'console';

import * as fs from 'fs';


@Injectable()
@CommandHandler(CreateClientAdminUserCommand)
export class CreateClientAdminUserHandler implements ICommandHandler<CreateClientAdminUserCommand> {
    constructor (
        private readonly rootPrisma: PrismaService,

        private readonly tenantUserRepository: TenantUserRepository,
        @Inject('ClientRepository') private readonly rootClientRepository: iClientRepositoryForClientAdmins,
        @Inject('UserRepository') private readonly userRepository: iUserRepositoryForClientAdmins,
        private readonly eventBus: EventBus,
        private readonly configService: ConfigService,
        @Inject(Logger) private readonly logger: LoggerService,
    ) {}

	async execute(command: CreateClientAdminUserCommand) {
        console.log('execute command : ', command);
		const { name, email, password, clientCode, clientName } = command;

        // 0. 유효한 clientCode인지 먼저 root DB에서 존재 확인
        const clientExists = await this.rootPrisma.client.findUnique({
            where: { clientCode },
            // select: { id: true, isPaid: true },
        });

        if (!clientExists) {
            this.logger.debug(`❌ 잘못된 클라이언트 코드입니다: '${clientCode}'`);
            errorResponseClientBadRequest(`잘못된 요청입니다.`);
        } else if (clientExists.isDbCreated) {
            this.logger.debug(`❌ 이미 DB 가 생성되어 있는 클라이언트 입니다: '${clientCode}'`); 
            errorResponseClientBadRequest(`잘못된 요청입니다.`);
        }
        else if (!clientExists.isPaid) {
            this.logger.debug(`❌ 결제되지 않은 클라이언트 코드입니다: '${clientCode}'`);
            errorResponseClientBadRequest(`해당 클라이언트에 문제가 생겼으니 관리자에게 문의하세요.`);
        }

        const dbName = `client_${clientCode.toLowerCase()}`; // ex> client_cl123abc
        console.log('execute() dbName : ', dbName);
        const dbUrl = `${this.configService.get<string>('DATABASE_BASE_URL')}/${dbName}`;
        console.log('execute() dbUrl : ', dbUrl);

        //DB 생성 (직접 쿼리)
        await this.createDatabase(dbName);
        console.log('DB 생성 완료 : ', dbName);

        await this.registerEnvKey(clientCode);

        //마이그레이션 실행 (별 프로세스)
        try {
            await this.runPrismaMigrate(dbUrl, clientCode);
        } catch (e) {
            this.logger.error(e.message);
            this.logger.debug(`❌ 마이그레이션 실패: \n'dbUrl: ${dbUrl}\nclientCode:${clientCode}'`);
            errorResponseClientBadRequest(`서버에 문제가 생겼습니다. 관리자에게 문의하세요.`);
        }
        await this.runPrismaMigrate(dbUrl, clientCode);
        console.log('마이그레이션 완료 : ', dbName);

        const createUserDto: CreateUserDto = {
            name,
            email,
            password,
        };
        const updateClientDto: UpdateClientDto = {
            name: clientName,
        };

        const createUserDbDto: CreateUserDbModel = {
            id: ulid(),
            name: createUserDto.name,
            email: createUserDto.email,
            password: await hashPassword(createUserDto.password),
            signupVerifyToken: await signupVerifyTokenCreate(),
            role: Role.ClientAdmin,
            verified: false,
            clientId: clientExists.id,
            createdAt: new Date(),
        }
        const updateClientDbDto: UpdateClientDbDto = {
            name: updateClientDto.name,
            dbUrl: dbUrl,
            dbName: dbName,
        }
        await this.rootClientRepository.updateClient(clientExists.id, updateClientDbDto);
        // const tenantClient = await this.tenantPrismaService.getPrismaClientByCode(clientCode);

        const encryptedClientCode = encryptClientCode(clientCode);
        this.eventBus.publish(new UserCreatedEvent(createUserDbDto.email, encryptedClientCode, createUserDbDto.signupVerifyToken));
        //TODO : 테넌트에 클라이언트 지우는 작업 후에 이 레거시 삭제 할 것
        await this.tenantUserRepository.createLegacyCompatibilityClientMeta(clientExists.clientCode, clientExists.id, updateClientDbDto);
        return await this.tenantUserRepository.createUser(clientExists.clientCode, createUserDbDto);
	}

    // MySQL에서 DB 직접 생성
    private async createDatabase(dbName: string) {
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
        });
        const [rows] = await connection.query(
            `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
            [dbName]
        );
        if (rows.length > 0) {
            await connection.end();
            this.logger.debug(`❌ DB '${dbName}' already exists.`);
            errorResponseClientBadRequest(`클라이언트 정보가 잘못되었습니다. 관리자에게 문의하세요.`);
        }

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.end();
    }

    private async runPrismaMigrate(dbUrl: string, clientCode: string) {
    return new Promise((resolve, reject) => {
        const folderPath = path.resolve(__dirname, `../../../prisma/generated/client_${clientCode.toLowerCase()}`);
        if (fs.existsSync(folderPath)) {
            this.logger.debug(`❌ 폴더가 이미 존재합니다: ${folderPath}`);
            return reject(new Error('폴더가 이미 존재합니다'));
        }

        const child = spawn('npm', ['run', 'migrate'], {
        env: {
            ...process.env,
            schema_type: 'tenant',
            config_name: `clientCreate_${clientCode}`,
            DATABASE_URL: dbUrl,
        },
        stdio: 'inherit', // 중요!
        shell: true,
        });

        child.on('close', (code) => {
        if (code === 0) {
            console.log('✅ 마이그레이션 성공!');
            resolve(null);
        } else {
            console.error(`❌ 마이그레이션 종료 코드: ${code}`);
            reject(new Error(`Migration failed with exit code ${code}`));
        }
        });

        child.on('error', (err) => {
            console.error('❌ child process error:', err);
            reject(err);
        });
    });
    }

    private async registerEnvKey(clientCode: string) {
        const registerScriptPath = path.resolve(__dirname, '../../../../register-env-key.js'); // 루트 기준
        return new Promise((resolve, reject) => {
            const child = spawn('node', [registerScriptPath], {
            env: {
                ...process.env,
                config_name: `clientCreate_${clientCode}`,
            },
            stdio: 'inherit',
            });

            child.on('close', (code) => {
            if (code === 0) resolve(null);
            else reject(new Error('Failed to register env key'));
            });
        });
    }

    private generateClientCode(): string {
        return `CL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    }
}