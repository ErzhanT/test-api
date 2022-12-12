import { IsEmail, IsString } from 'class-validator';

export class UsersRegisterDto {
	@IsEmail({}, { message: 'incorrect email' })
	email: string;

	@IsString({ message: 'password does not set' })
	password: string;

	@IsString({ message: 'name does not set' })
	name: string;
}
