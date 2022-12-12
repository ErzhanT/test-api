export class UserResponseDto {
	user: {
		id: number;
		email: string;
		name?: string;
	};
	accessToken: string;
	refreshToken: string;
}
