import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { FilesRepository } from './files.repository';
import { IFilesService } from './files.service.interface';
import { FileResponseDto } from './dtos/file-response.dto';
import { FileModel } from '@prisma/client';

@injectable()
export class FilesService implements IFilesService {
	constructor(@inject(TYPES.FilesRepository) private fileRepository: FilesRepository) {}

	async upload(img: any): Promise<FileResponseDto> {
		return this.fileRepository.create(img);
	}

	async findOne(id: number): Promise<FileResponseDto | null> {
		return this.fileRepository.findOne(id);
	}

	async findAll(limit?: string, offset?: string): Promise<FileResponseDto[]> {
		return this.fileRepository.findAll(limit, offset);
	}

	async download(id: number): Promise<FileModel | null> {
		return this.fileRepository.findOne(id);
	}

	async delete(id: number): Promise<FileResponseDto> {
		return this.fileRepository.removeOne(id);
	}

	async update(id: number, data: any): Promise<FileResponseDto> {
		return this.fileRepository.updateOne(id, data);
	}
}
