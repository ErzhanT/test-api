export interface IFilesService {
	upload: (img: any) => void;
	findOne: (id: number) => void;
	findAll: (limit?: string, offset?: string) => void;
	download: (id: number) => void;
	delete: (id: number) => void;
	update: (id: number, data: any) => void;
}
