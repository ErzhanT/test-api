import { IUsersRepository } from './users.repository.interface';
import { Users } from './enitity/users.entity';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { PrismaService } from '../database/prisma.service';
import { UserModel } from '@prisma/client';

@injectable()
export class UsersRepository implements IUsersRepository {
	constructor(@inject(TYPES.PrismaService) private prismaService: PrismaService) {}

	async create({ email, password, name }: Users): Promise<UserModel> {
		return this.prismaService.client.userModel.create({
			data: {
				email,
				password,
				name,
			},
		});
	}

	async findById(id: number): Promise<UserModel | null> {
		return this.prismaService.client.userModel.findFirst({
			where: {
				id,
			},
		});
	}

	async findByEmail(email: string): Promise<UserModel | null> {
		return this.prismaService.client.userModel.findFirst({
			where: {
				email,
			},
		});
	}
}
