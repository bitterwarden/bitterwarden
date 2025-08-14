import { z } from "zod";
import { CryptoService } from "../crypto";
import type { EncryptedVault, Vault, VaultItem } from "../types";
import { VaultSchema } from "../types";
import { SecureMemoryPool } from "./secure-memory";

export class VaultService {
	private vault: Vault;
	private masterKey: CryptoKey | null = null;
	private memoryPool: SecureMemoryPool;
	private autoLockTimer: NodeJS.Timeout | null = null;
	private readonly AUTO_LOCK_TIME = 5 * 60 * 1000; // 5 minutes

	constructor() {
		this.vault = {
			version: 1,
			items: [],
			settings: {
				syncEnabled: false,
				autoSync: false,
				syncInterval: 300000,
				gitBranch: "main",
			},
		};
		this.memoryPool = new SecureMemoryPool();
		this.setupAutoLock();
	}

	private setupAutoLock(): void {
		// Clear any existing timer
		if (this.autoLockTimer) {
			clearTimeout(this.autoLockTimer);
		}

		// Set new auto-lock timer
		if (this.masterKey) {
			this.autoLockTimer = setTimeout(() => {
				this.lock();
			}, this.AUTO_LOCK_TIME);
		}
	}

	private resetAutoLock(): void {
		this.setupAutoLock();
	}

	async unlock(
		password: string,
		encryptedVault?: EncryptedVault,
	): Promise<void> {
		if (encryptedVault) {
			const salt = Buffer.from(encryptedVault.salt, "base64");
			const iv = Buffer.from(encryptedVault.iv, "base64");
			const data = Buffer.from(encryptedVault.data, "base64");

			this.masterKey = await CryptoService.deriveKey(
				password,
				new Uint8Array(salt),
			);

			// Create a proper ArrayBuffer from the Buffer
			const dataArrayBuffer = new ArrayBuffer(data.length);
			const dataView = new Uint8Array(dataArrayBuffer);
			dataView.set(data);

			const decrypted = await CryptoService.decrypt(
				dataArrayBuffer,
				this.masterKey,
				new Uint8Array(iv),
			);

			const parsed = JSON.parse(decrypted);
			this.vault = VaultSchema.parse(parsed);
		} else {
			const salt = CryptoService.generateSalt();
			this.masterKey = await CryptoService.deriveKey(password, salt);
		}
	}

	async lock(): Promise<EncryptedVault | null> {
		if (!this.masterKey) return null;

		const salt = CryptoService.generateSalt();
		const key = await CryptoService.deriveKey(
			await this.exportMasterKey(),
			salt,
		);

		const vaultString = JSON.stringify(this.vault);
		const { encrypted, iv } = await CryptoService.encrypt(vaultString, key);

		// Clear sensitive data from memory
		this.masterKey = null;
		this.vault.items = [];
		this.memoryPool.wipeAll();

		// Clear auto-lock timer
		if (this.autoLockTimer) {
			clearTimeout(this.autoLockTimer);
			this.autoLockTimer = null;
		}

		return {
			salt: Buffer.from(salt).toString("base64"),
			iv: Buffer.from(iv).toString("base64"),
			data: Buffer.from(encrypted).toString("base64"),
			version: this.vault.version,
		};
	}

	private async exportMasterKey(): Promise<string> {
		if (!this.masterKey) throw new Error("Vault is locked");
		const exported = await crypto.subtle.exportKey("raw", this.masterKey);
		return Buffer.from(exported).toString("base64");
	}

	addItem(item: Omit<VaultItem, "id" | "createdAt" | "updatedAt">): VaultItem {
		this.resetAutoLock(); // Reset timer on activity

		const newItem: VaultItem = {
			...item,
			id: crypto.randomUUID(),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		this.vault.items.push(newItem);
		return newItem;
	}

	updateItem(id: string, updates: Partial<VaultItem>): VaultItem | null {
		const index = this.vault.items.findIndex((item) => item.id === id);
		if (index === -1) return null;

		const updatedItem = {
			...this.vault.items[index],
			...updates,
			id: this.vault.items[index].id,
			createdAt: this.vault.items[index].createdAt,
			updatedAt: new Date().toISOString(),
		};

		this.vault.items[index] = updatedItem;
		return updatedItem;
	}

	deleteItem(id: string): boolean {
		const index = this.vault.items.findIndex((item) => item.id === id);
		if (index === -1) return false;

		this.vault.items.splice(index, 1);
		return true;
	}

	getItem(id: string): VaultItem | null {
		return this.vault.items.find((item) => item.id === id) || null;
	}

	getAllItems(): VaultItem[] {
		return [...this.vault.items];
	}

	searchItems(query: string): VaultItem[] {
		const lowerQuery = query.toLowerCase();
		return this.vault.items.filter(
			(item) =>
				item.name.toLowerCase().includes(lowerQuery) ||
				item.username?.toLowerCase().includes(lowerQuery) ||
				item.url?.toLowerCase().includes(lowerQuery) ||
				item.notes?.toLowerCase().includes(lowerQuery) ||
				item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
		);
	}

	getSettings() {
		return { ...this.vault.settings };
	}

	updateSettings(settings: Partial<Vault["settings"]>) {
		this.vault.settings = { ...this.vault.settings, ...settings };
	}

	export(): Vault {
		return JSON.parse(JSON.stringify(this.vault));
	}

	import(data: Vault): void {
		this.vault = VaultSchema.parse(data);
	}
}
