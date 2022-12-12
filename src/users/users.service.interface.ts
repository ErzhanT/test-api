import { UsersRegisterDto } from './dtos/users-register.dto';
import { UsersLoginDto } from './dtos/users-login.dto';
import { UserModel, TokenModel } from '@prisma/client';
import { GenerateTokenDto } from './dtos/generate-token.dto';
import { UserResponseDto } from './dtos/user-response.dto';

export interface IUsersService {
	createUser: (dto: UsersRegisterDto) => Promise<UserResponseDto>;
	validateUser: (dto: UsersLoginDto) => Promise<UserResponseDto>;
	getUserInfo: (id: number) => Promise<UserModel | null>;
	generateTokens: (email: string) => Promise<GenerateTokenDto>;
	saveToken: (userId: number, token: string) => Promise<TokenModel>;
	logout: (refreshToken: string) => Promise<any>;
	refresh: (refreshToken: string) => Promise<any>;
}
