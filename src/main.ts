import { Container, ContainerModule, interfaces } from 'inversify';
import { App } from './app';
import { LoggerService } from './logger/logger.service';
import { UsersController } from './users/users.controller';
import { ExceptionFilter } from './errors/exception.filter';
import { ILogger } from './logger/logger.interface';
import { TYPES } from './types';
import { IExceptionFilter } from './errors/exception.filter.interface';
import { UsersService } from './users/users.service';
import { IUsersService } from './users/users.service.interface';
import { IUsersController } from './users/users.controller.interface';
import { IConfigService } from './config/config.service.interface';
import { ConfigService } from './config/config.service';
import { PrismaService } from './database/prisma.service';
import { UsersRepository } from './users/users.repository';
import { IUsersRepository } from './users/users.repository.interface';
import { ITokenRepository } from './users/token.repository.interface';
import { TokenRepository } from './users/token.repository';
import { IFilesRepository } from './files/files.repository.interface';
import { FilesRepository } from './files/files.repository';
import { IFilesController } from './files/files.controller.interface';
import { IFilesService } from './files/files.service.interface';
import { FilesController } from './files/files.controller';
import { FilesService } from './files/files.service';
// async function bootstrap() {
// const logger = new LoggerService();
// const app = new App(
//   logger,
//   new UsersController(logger),
//   new ExceptionFilter(logger));

export interface IBootstrapReturn {
	appContainer: Container;
	app: App;
}

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
	bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope();
	bind<IExceptionFilter>(TYPES.ExceptionFilter).to(ExceptionFilter);
	bind<IUsersController>(TYPES.UsersController).to(UsersController);
	bind<IUsersService>(TYPES.UsersService).to(UsersService);
	bind<IConfigService>(TYPES.ConfigService).to(ConfigService).inSingletonScope();
	bind<PrismaService>(TYPES.PrismaService).to(PrismaService).inSingletonScope();
	bind<IUsersRepository>(TYPES.UsersRepository).to(UsersRepository).inSingletonScope();
	bind<ITokenRepository>(TYPES.TokenRepository).to(TokenRepository);
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	bind<IFilesRepository>(TYPES.FilesRepository).to(FilesRepository).inSingletonScope();
	bind<IFilesService>(TYPES.FilesService).to(FilesService).inSingletonScope();
	bind<IFilesController>(TYPES.FilesController).to(FilesController).inSingletonScope();
	bind<App>(TYPES.Application).to(App);
});

function bootstrap(): IBootstrapReturn {
	const appContainer = new Container();
	appContainer.load(appBindings);
	const app = appContainer.get<App>(TYPES.Application);

	app.init();
	return { appContainer, app };
}

export const { app, appContainer } = bootstrap();
// }

// bootstrap();
