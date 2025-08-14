// FileSystem interface for isomorphic-git
// Based on the requirements from isomorphic-git library
export interface GitFS {
	promises: {
		readFile(
			filepath: string,
			options?: { encoding?: string },
		): Promise<Uint8Array | string>;
		writeFile(
			filepath: string,
			data: Uint8Array | string,
			options?: { encoding?: string; mode?: number },
		): Promise<void>;
		unlink(filepath: string): Promise<void>;
		readdir(filepath: string): Promise<string[]>;
		mkdir(filepath: string, options?: { recursive?: boolean }): Promise<void>;
		rmdir(filepath: string, options?: { recursive?: boolean }): Promise<void>;
		stat(filepath: string): Promise<{
			isFile(): boolean;
			isDirectory(): boolean;
			size: number;
			mode: number;
			mtimeMs: number;
		}>;
		lstat(filepath: string): Promise<{
			isFile(): boolean;
			isDirectory(): boolean;
			isSymbolicLink(): boolean;
			size: number;
			mode: number;
			mtimeMs: number;
		}>;
		readlink?(filepath: string): Promise<string>;
		symlink?(target: string, filepath: string): Promise<void>;
		chmod?(filepath: string, mode: number): Promise<void>;
	};
}
