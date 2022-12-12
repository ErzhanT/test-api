export class Files {
	constructor(
		private readonly _originalName: string,
		private readonly _filename: string,
		private readonly _mimeType: string,
		private readonly _contentSize: string,
		private readonly _destination: string,
		private readonly _path: string,
	) {}

	get name(): string {
		return this._originalName;
	}

	get mimeType(): string {
		return this._mimeType;
	}

	get filename(): string {
		return this._filename;
	}

	get contentSize(): string {
		return this._contentSize;
	}

	get destination(): string {
		return this._destination;
	}

	get path(): string {
		return this._path;
	}
}
