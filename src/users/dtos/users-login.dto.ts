import { IsEmail, IsString } from 'class-validator';

export class UsersLoginDto {
	@IsEmail({}, { message: 'incorrect email' })
	email: string;
	@IsString({ message: 'password does not set' })
	password: string;
}
