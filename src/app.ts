import express, { Express } from 'express';
import { Server } from 'http';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { json, urlencoded } from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { UsersController } from './users/users.controller';
import { ExceptionFilter } from './errors/exception.filter';
import { TYPES } from './types';
import { ILogger } from './logger/logger.interface';
import { UsersService } from './users/users.service';
import { PrismaService } from './database/prisma.service';
import { UsersRepository } from './users/users.repository';
import { AuthMiddleware } from './common/auth.middleware';
import { IConfigService } from './config/config.service.interface';
import { IFilesService } from './files/files.service.interface';
import { IFilesRepository } from './files/files.repository.interface';
import { FilesController } from './files/files.controller';

@injectable()
export class App {
	app: Express;
	server: Server;
	port: number;

	constructor(
		@inject(TYPES.ILogger) private logger: ILogger,
		@inject(TYPES.UsersController) private usersController: UsersController,
		@inject(TYPES.UsersService) private usersService: UsersService,
		@inject(TYPES.ExceptionFilter) private readonly exceptionFilter: ExceptionFilter,
		@inject(TYPES.PrismaService) private readonly prismaService: PrismaService,
		@inject(TYPES.UsersRepository) private readonly usersRepository: UsersRepository,
		@inject(TYPES.ConfigService) private readonly configService: IConfigService,
		@inject(TYPES.FilesController) private filesController: FilesController,
		@inject(TYPES.FilesService) private filesService: IFilesService,
		@inject(TYPES.FilesRepository) private readonly filesRepository: IFilesRepository,
	) {
		this.app = express();
		this.port = 8000;
	}

	useMiddleware(): void {
		this.app.use(json());
		this.app.use(urlencoded({ extended: true }));
		const authMiddleware = new AuthMiddleware(this.configService.get('JWT_ACCESS_SECRET'));
		this.app.use(authMiddleware.execute.bind(authMiddleware));
	}

	useCookieParser(): void {
		this.app.use(cookieParser());
	}

	useCors(): void {
		this.app.use(cors());
	}

	useRoutes(): void {
		this.app.use('/users', this.usersController.router);
		this.app.use('/files', this.filesController.router);
	}

	useExceptionFilters(): void {
		this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
	}

	public async init(): Promise<void> {
		this.useMiddleware();
		this.useCookieParser();
		this.useCors();
		this.useRoutes();
		this.useExceptionFilters();
		await this.prismaService.connect();
		this.server = this.app.listen(this.port);
		this.logger.log(`Server started on http://localhost:${this.port}`);
	}
}
