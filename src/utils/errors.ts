export class UpstreamError extends Error {
	constructor(message: string, public cause?: unknown) {
		super(message);
		this.name = 'UpstreamError';
	}
}


