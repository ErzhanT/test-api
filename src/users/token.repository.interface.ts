import { TokenModel } from '@prisma/client';

export interface ITokenRepository {
	create: (userId: number, token: string) => Promise<TokenModel>;
	findToken: (refreshToken: string) => Promise<any>;
	removeToken: (refreshToken: string) => Promise<any>;
}
