import { UserModel } from '@prisma/client';
import { Users } from './enitity/users.entity';

export interface IUsersRepository {
	create: (user: Users) => Promise<UserModel>;
	findById: (id: number) => Promise<UserModel | null>;
	findByEmail: (email: string) => Promise<UserModel | null>;
}
