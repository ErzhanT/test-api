import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { PrismaService } from '../database/prisma.service';
import { IFilesRepository } from './files.repository.interface';
import { FileModel } from '@prisma/client';

@injectable()
export class FilesRepository implements IFilesRepository {
	constructor(@inject(TYPES.PrismaService) private prismaService: PrismaService) {}

	async create(payload: any): Promise<FileModel> {
		return this.prismaService.client.fileModel.create({
			data: {
				originalname: payload.originalname,
				filename: payload.filename,
				mimetype: payload.mimetype,
				contentSize: payload.size,
				path: payload.path,
				destination: payload.destination,
			},
		});
	}

	async findAll(limit?: string, offset?: string): Promise<FileModel[]> {
		return this.prismaService.client.fileModel.findMany({
			skip: offset ? +offset : 0,
			take: limit ? +limit : 10,
		});
	}

	async findOne(id: number): Promise<FileModel | null> {
		return this.prismaService.client.fileModel.findFirst({
			where: { id: Number(id) },
		});
	}

	async removeOne(id: number): Promise<FileModel> {
		return this.prismaService.client.fileModel.delete({
			where: { id },
		});
	}

	async updateOne(id: number, data: any): Promise<FileModel> {
		return this.prismaService.client.fileModel.update({
			where: { id },
			data: {
				originalname: data.originalname,
				filename: data.filename,
				mimetype: data.mimetype,
				contentSize: data.size,
				path: data.path,
				destination: data.destination,
			},
		});
	}
}
