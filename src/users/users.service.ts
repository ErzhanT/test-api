import { inject, injectable } from 'inversify';

import { IUsersService } from './users.service.interface';
import { UsersRegisterDto } from './dtos/users-register.dto';
import { Users } from './enitity/users.entity';
import { UsersLoginDto } from './dtos/users-login.dto';
import { TYPES } from '../types';
import { IConfigService } from '../config/config.service.interface';
import { IUsersRepository } from './users.repository.interface';
import { UserModel, TokenModel } from '@prisma/client';
import { ITokenRepository } from './token.repository.interface';
import { sign } from 'jsonwebtoken';
import { GenerateTokenDto } from './dtos/generate-token.dto';
import { ILogger } from '../logger/logger.interface';
import { UserResponseDto } from './dtos/user-response.dto';

@injectable()
export class UsersService implements IUsersService {
	constructor(
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.UsersRepository) private usersRepository: IUsersRepository,
		@inject(TYPES.TokenRepository) private tokenRepository: ITokenRepository,
	) {}
	async createUser({ email, name, password }: UsersRegisterDto): Promise<UserResponseDto> {
		const newUser = new Users(email, name);
		const salt = this.configService.get('SALT');
		await newUser.setPassword(password, Number(salt));
		const existedUser = await this.usersRepository.findByEmail(newUser.email);
		if (existedUser) {
			this.loggerService.error('user exist');
			throw new Error('user exist');
		}

		const tokens = await this.generateTokens(newUser.email);

		const createdUser = await this.usersRepository.create(newUser);

		if (tokens) {
			await this.saveToken(createdUser.id, tokens.refreshToken);
		}

		return {
			user: { id: createdUser.id, email: createdUser.email, name: createdUser.name },
			...tokens,
		};
	}

	async validateUser({ email, password }: UsersLoginDto): Promise<UserResponseDto> {
		const existedUser = await this.usersRepository.findByEmail(email);
		if (!existedUser) {
			this.loggerService.error('user not found');
			throw new Error('user not found');
		}
		const newUser = new Users(existedUser.email, existedUser.name, existedUser.password);
		const isPassEquals = await newUser.comparePassword(password);
		if (!isPassEquals) {
			this.loggerService.error('pass not equals');
			throw new Error('user pass not equals');
		}

		const tokens = await this.generateTokens(newUser.email);

		if (tokens) {
			await this.saveToken(existedUser.id, tokens.refreshToken);
		}

		return { ...tokens, user: { id: existedUser.id, email: existedUser.email } };
	}

	async getUserInfo(id: number): Promise<UserModel | null> {
		return this.usersRepository.findById(id);
	}

	async generateTokens(email: string): Promise<GenerateTokenDto> {
		const accessToken = await new Promise<string>((resolve, reject) => {
			sign(
				{
					email,
					iat: Math.floor(Date.now() / 1000),
				},
				this.configService.get('JWT_ACCESS_SECRET'),
				{
					algorithm: 'HS256',
					expiresIn: '3600s',
				},
				(err, token) => {
					if (err) {
						reject(err);
					}
					resolve(token as string);
				},
			);
		});

		const refreshToken = await new Promise<string>((resolve, reject) => {
			sign(
				{
					email,
					iat: Math.floor(Date.now() / 1000),
				},
				this.configService.get('JWT_REFRESH_SECRET'),
				{
					algorithm: 'HS256',
					expiresIn: '7d',
				},
				(err, token) => {
					if (err) {
						reject(err);
					}
					resolve(token as string);
				},
			);
		});

		return {
			accessToken,
			refreshToken,
		};
	}

	async saveToken(userId: number, refreshToken: string): Promise<TokenModel> {
		return this.tokenRepository.create(userId, refreshToken);
	}

	async logout(refreshToken: string): Promise<void> {
		return this.tokenRepository.removeToken(refreshToken);
	}

	async refresh(refreshToken: string): Promise<UserResponseDto> {
		if (!refreshToken) {
			this.loggerService.error('token did not send');
			throw new Error('token did not send');
		}
		const tokenFromDb = await this.tokenRepository.findToken(refreshToken);
		if (!tokenFromDb) {
			this.loggerService.error('token not found');
			throw new Error('token not found');
		}
		const user = await this.usersRepository.findById(tokenFromDb.userId);
		if (!user) {
			this.loggerService.error('user not found');
			throw new Error('user not found');
		}

		const tokens = await this.generateTokens(user.email);
		if (!tokens) {
			throw new Error('token does not generated');
		}
		await this.saveToken(user.id, tokens.refreshToken);

		return { ...tokens, user: { id: user.id, email: user.email } };
	}
}
