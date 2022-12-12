import { inject, injectable } from 'inversify';
import { NextFunction, Request, Response } from 'express';
import 'reflect-metadata';
// import { parse } from 'node:querystring';

import { TYPES } from '../types';
import { FilesService } from './files.service';
import { BaseController } from '../common/base.controller';
import { IFilesController } from './files.controller.interface';
import { IConfigService } from '../config/config.service.interface';
import { ILogger } from '../logger/logger.interface';
import { handleSingleUploadFile } from '../../utils/uploadSingle';
import * as fs from 'fs';
import { HttpError } from '../errors/http-error.class';
import { PaginationQuery } from '../common/types.common';
import { AuthGuard } from '../common/auth.guard';

@injectable()
export class FilesController extends BaseController implements IFilesController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.FilesService) private fileService: FilesService,
		@inject(TYPES.ConfigService) private configService: IConfigService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: '/upload',
				method: 'post',
				func: this.upload,
				middlewares: [new AuthGuard()],
			},
			{
				path: '/list',
				method: 'get',
				func: this.list,
				middlewares: [new AuthGuard()],
			},
			{
				path: '/:id',
				method: 'get',
				func: this.findOne,
				middlewares: [new AuthGuard()],
			},
			{
				path: '/delete/:id',
				method: 'delete',
				func: this.delete,
				middlewares: [new AuthGuard()],
			},
			{
				path: '/download/:id',
				method: 'get',
				func: this.download,
				middlewares: [new AuthGuard()],
			},
			{
				path: '/:id',
				method: 'put',
				func: this.update,
				middlewares: [new AuthGuard()],
			},
		]);
	}

	async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
		const uploadResult = await handleSingleUploadFile(req, res);
		const uploadedFile = uploadResult.file;
		if (!uploadedFile) {
			this.loggerService.error('file not uploaded');
			return next(new HttpError(404, 'error: file does not exist'));
		}

		await this.fileService.upload({ ...uploadedFile });

		this.ok(res, { ...uploadedFile });
	}

	async list(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { limit, offset } = req.query as PaginationQuery;

		const files = await this.fileService.findAll(limit, offset);

		this.ok(res, { files });
	}

	async delete({ params, body }: Request, res: Response, next: NextFunction): Promise<void> {
		const file = await this.fileService.findOne(+params.id);
		if (!file) {
			this.loggerService.error('file not found');
			throw next(new HttpError(404, 'error: file does not exist'));
		}

		await fs.access(file.path, fs.constants.F_OK | fs.constants.W_OK, async (err) => {
			if (err) {
				throw new Error('file not found');
			} else {
				await fs.unlink(file.path, (err) => {
					if (err && err.code == 'ENOENT') {
						this.loggerService.log(`File doesn't exist, won't remove it.`);
						throw new HttpError(404, `error: File doesn't exist, won't remove it.`);
					} else if (err) {
						this.loggerService.error('Error occurred while trying to remove file');
						throw new HttpError(400, `error: Error occurred while trying to remove file`);
					} else {
						this.loggerService.log(`removed!`);
					}
				});
			}
		});

		const deletedFile = await this.fileService.delete(file.id);

		this.ok(res, { ...deletedFile });
	}

	async findOne({ params }: Request, res: Response, next: NextFunction): Promise<void> {
		const file = await this.fileService.findOne(+params.id);

		this.ok(res, { ...file });
	}

	async download({ params }: Request, res: Response, next: NextFunction): Promise<void> {
		const file = await this.fileService.findOne(+params.id);
		if (!file) {
			this.loggerService.error('file not found');
			return next(new HttpError(404, 'error: file does not found'));
		}
		return res.download(file.path, file.originalname);
	}

	async update(req: Request, res: Response, next: NextFunction): Promise<void> {
		const file = await this.fileService.findOne(+req.params.id);
		console.log(file);
		if (!file) {
			this.loggerService.error('file not found');
			throw new HttpError(404, 'error: file does not found');
		}
		const updatedResult = await handleSingleUploadFile(req, res);

		await fs.access(file.path, fs.constants.F_OK | fs.constants.W_OK, async (err) => {
			if (err) {
				throw new Error('file not found');
			} else {
				await fs.unlink(file.path, (err) => {
					if (err && err.code == 'ENOENT') {
						this.loggerService.log(`File doesn't exist, won't remove it.`);
						throw new HttpError(404, `error: File doesn't exist, won't remove it.`);
					} else if (err) {
						this.loggerService.error('Error occurred while trying to remove file');
						throw new HttpError(400, `error: Error occurred while trying to remove file`);
					} else {
						this.loggerService.log(`removed!`);
					}
				});
			}
		});

		const updateFile = updatedResult.file;
		if (!updateFile) {
			this.loggerService.error('file not uploaded');
			throw new HttpError(404, 'error: file does not exist');
		}
		const updatedFile = await this.fileService.update(file.id, updateFile);

		this.ok(res, { ...updatedFile });
	}
}
