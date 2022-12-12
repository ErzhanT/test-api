import { TYPES } from '../types';
import { PrismaService } from '../database/prisma.service';
import { inject, injectable } from 'inversify';
import { ITokenRepository } from './token.repository.interface';
import { TokenModel } from '@prisma/client';

@injectable()
export class TokenRepository implements ITokenRepository {
	constructor(@inject(TYPES.PrismaService) private prismaService: PrismaService) {}

	async create(userId: number, refreshToken: string): Promise<TokenModel> {
		const tokenData = await this.prismaService.client.tokenModel.findFirst({
			where: { userId },
		});
		if (tokenData) {
			return this.prismaService.client.tokenModel.update({
				where: { userId },
				data: { refreshToken },
			});
		}

		return this.prismaService.client.tokenModel.create({
			data: {
				userId: userId,
				refreshToken,
			},
		});
	}

	async findToken(refreshToken: string): Promise<any> {
		return this.prismaService.client.tokenModel.findFirst({
			where: { refreshToken },
		});
	}

	async removeToken(refreshToken: string): Promise<any> {
		return this.prismaService.client.tokenModel.deleteMany({
			where: { refreshToken },
		});
	}
}
