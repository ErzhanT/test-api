import { FileModel } from '@prisma/client';

export interface IFilesRepository {
	create: (payload: any) => Promise<FileModel>;
	findOne: (id: number) => Promise<FileModel | null>;
	findAll: (limit?: string, offset?: string) => Promise<FileModel[]>;
	removeOne: (id: number) => Promise<FileModel>;
	updateOne: (id: number, data: any) => Promise<FileModel>;
}
