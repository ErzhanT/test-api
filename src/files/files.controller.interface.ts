import { NextFunction, Request, Response } from 'express';

export interface IFilesController {
	upload: (req: Request, res: Response, next: NextFunction) => void;
	list: (req: Request, res: Response, next: NextFunction) => void;
	delete: (req: Request, res: Response, next: NextFunction) => void;
	findOne: (req: Request, res: Response, next: NextFunction) => void;
	download: (req: Request, res: Response, next: NextFunction) => void;
	update: (req: Request, res: Response, next: NextFunction) => void;
}
