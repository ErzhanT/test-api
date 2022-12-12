import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

import { BaseController } from '../common/base.controller';
import { HttpError } from '../errors/http-error.class';
import { TYPES } from '../types';
import { ILogger } from '../logger/logger.interface';
import { IUsersController } from './users.controller.interface';
import { UsersLoginDto } from './dtos/users-login.dto';
import { UsersRegisterDto } from './dtos/users-register.dto';
import { ValidateMiddleware } from '../common/validate.middleware';
import { IUsersService } from './users.service.interface';
import { IConfigService } from '../config/config.service.interface';
import { AuthGuard } from '../common/auth.guard';

@injectable()
export class UsersController extends BaseController implements IUsersController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.UsersService) private usersService: IUsersService,
		@inject(TYPES.ConfigService) private configService: IConfigService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: '/signup',
				method: 'post',
				func: this.register,
				middlewares: [new ValidateMiddleware(UsersRegisterDto)],
			},
			{
				path: '/signin',
				method: 'post',
				func: this.login,
				middlewares: [new ValidateMiddleware(UsersLoginDto)],
			},
			{
				path: '/info',
				method: 'get',
				func: this.info,
				middlewares: [new AuthGuard()],
			},
			{
				path: '/logout',
				method: 'post',
				func: this.logout,
				middlewares: [new AuthGuard()],
			},
			{
				path: '/signin/new_token',
				method: 'post',
				func: this.refresh,
				middlewares: [new AuthGuard()],
			},
		]);
	}

	async login(
		{ body }: Request<{}, {}, UsersLoginDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.usersService.validateUser(body);
		if (!result) {
			return next(new HttpError(401, 'error authorization', 'login'));
		}

		res.cookie('refreshToken', result.refreshToken, {
			maxAge: 7 * 24 * 60 * 60 * 1000,
			httpOnly: true,
		});
		this.ok(res, { ...result });
	}

	async register(
		{ body }: Request<{}, {}, UsersRegisterDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.usersService.createUser(body);
		if (!result) {
			return next(new HttpError(422, 'error: user exist'));
		}
		res.cookie('refreshToken', result.refreshToken, {
			maxAge: 7 * 24 * 60 * 60 * 1000,
			httpOnly: true,
		});

		this.ok(res, { ...result });
	}

	async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { refreshToken } = req.cookies;
		const token = await this.usersService.logout(refreshToken);
		this.ok(res, { token });
	}

	async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { refreshToken } = req.cookies;
		const tokens = await this.usersService.refresh(refreshToken);
		res.cookie('refreshToken', tokens.refreshToken, {
			maxAge: 7 * 24 * 60 * 60 * 1000,
			httpOnly: true,
		});
		this.ok(res, { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
	}

	async info({ user }: Request, res: Response, next: NextFunction): Promise<void> {
		const userInfo = await this.usersService.getUserInfo(user.email);
		this.ok(res, { id: userInfo?.id });
	}
}
