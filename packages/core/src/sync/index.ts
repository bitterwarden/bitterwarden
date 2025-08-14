import git from "isomorphic-git";
import http from "isomorphic-git/http/web";
import type { EncryptedVault, GitConfig, SyncStatus } from "../types";

export class GitSyncService {
	private config: GitConfig | null = null;
	private status: SyncStatus = {
		lastSync: null,
		isSyncing: false,
		error: null,
		pendingChanges: 0,
	};

	async initialize(config: GitConfig): Promise<void> {
		if (!config.isPrivate) {
			throw new Error("Only private repositories are allowed for security");
		}

		this.config = config;

		if (config.provider === "github") {
			await this.validateGitHubRepo(config);
		}
	}

	private async validateGitHubRepo(config: GitConfig): Promise<void> {
		if (!config.authToken) {
			throw new Error("GitHub authentication token is required");
		}

		const repoPath = config.remote
			.replace("https://github.com/", "")
			.replace(".git", "");
		const response = await fetch(`https://api.github.com/repos/${repoPath}`, {
			headers: {
				Authorization: `Bearer ${config.authToken}`,
				Accept: "application/vnd.github.v3+json",
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to access repository: ${response.statusText}`);
		}

		const repo = await response.json();
		if (!repo.private) {
			throw new Error("Repository must be private");
		}
	}

	async clone(fs: any, dir: string): Promise<void> {
		if (!this.config) {
			throw new Error("Git sync not initialized");
		}

		this.status.isSyncing = true;
		this.status.error = null;

		try {
			await git.clone({
				fs,
				http,
				dir,
				url: this.config.remote,
				ref: this.config.branch,
				singleBranch: true,
				depth: 1,
				onAuth: () => ({
					username: this.config!.username || "token",
					password: this.config!.authToken!,
				}),
			});

			this.status.lastSync = new Date();
		} catch (error) {
			this.status.error =
				error instanceof Error ? error.message : "Clone failed";
			throw error;
		} finally {
			this.status.isSyncing = false;
		}
	}

	async pull(fs: any, dir: string): Promise<boolean> {
		if (!this.config) {
			throw new Error("Git sync not initialized");
		}

		this.status.isSyncing = true;
		this.status.error = null;

		try {
			const before = await git.resolveRef({ fs, dir, ref: "HEAD" });

			await git.pull({
				fs,
				http,
				dir,
				ref: this.config.branch,
				singleBranch: true,
				onAuth: () => ({
					username: this.config!.username || "token",
					password: this.config!.authToken!,
				}),
			});

			const after = await git.resolveRef({ fs, dir, ref: "HEAD" });
			this.status.lastSync = new Date();

			return before !== after;
		} catch (error) {
			this.status.error =
				error instanceof Error ? error.message : "Pull failed";
			throw error;
		} finally {
			this.status.isSyncing = false;
		}
	}

	async push(fs: any, dir: string, vault: EncryptedVault): Promise<void> {
		if (!this.config) {
			throw new Error("Git sync not initialized");
		}

		this.status.isSyncing = true;
		this.status.error = null;

		try {
			const vaultPath = `${dir}/vault.encrypted`;
			await fs.writeFile(vaultPath, JSON.stringify(vault, null, 2));

			await git.add({ fs, dir, filepath: "vault.encrypted" });

			await git.commit({
				fs,
				dir,
				message: `Update vault - ${new Date().toISOString()}`,
				author: {
					name: this.config.username || "Bitterwarden",
					email: this.config.email || "vault@bitterwarden.app",
				},
			});

			await git.push({
				fs,
				http,
				dir,
				remote: "origin",
				ref: this.config.branch,
				onAuth: () => ({
					username: this.config!.username || "token",
					password: this.config!.authToken!,
				}),
			});

			this.status.lastSync = new Date();
			this.status.pendingChanges = 0;
		} catch (error) {
			this.status.error =
				error instanceof Error ? error.message : "Push failed";
			throw error;
		} finally {
			this.status.isSyncing = false;
		}
	}

	async checkForUpdates(fs: any, dir: string): Promise<boolean> {
		if (!this.config) return false;

		try {
			const remoteRefs = await git.listServerRefs({
				http,
				url: this.config.remote,
				prefix: `refs/heads/${this.config.branch}`,
				onAuth: () => ({
					username: this.config!.username || "token",
					password: this.config!.authToken!,
				}),
			});

			if (remoteRefs.length === 0) return false;

			const localRef = await git.resolveRef({ fs, dir, ref: "HEAD" });
			const remoteRef = remoteRefs[0].oid;

			return localRef !== remoteRef;
		} catch (error) {
			console.error("Failed to check for updates:", error);
			return false;
		}
	}

	getStatus(): SyncStatus {
		return { ...this.status };
	}

	incrementPendingChanges(): void {
		this.status.pendingChanges++;
	}

	isConfigured(): boolean {
		return this.config !== null;
	}
}
