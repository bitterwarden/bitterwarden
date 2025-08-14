import { decrypt, encrypt } from "../crypto";
import type { EncryptedVault, Vault, VaultItem } from "../types";
import { VaultSchema } from "../types";
import { SecureMemoryPool } from "./secure-memory";

export class VaultService {
	private vault: Vault;
	private masterPassword: string | null = null;
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
		if (this.masterPassword) {
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
			// Decrypt existing vault
			const decrypted = await decrypt(encryptedVault.data, password);
			const parsed = JSON.parse(decrypted);
			this.vault = VaultSchema.parse(parsed);
			this.masterPassword = password;
		} else {
			// Create new vault
			this.masterPassword = password;
		}
		this.setupAutoLock();
	}

	async lock(): Promise<EncryptedVault | null> {
		if (!this.masterPassword) return null;

		const vaultString = JSON.stringify(this.vault);
		const encryptedData = await encrypt(vaultString, this.masterPassword);

		// Clear sensitive data from memory
		this.masterPassword = null;
		this.vault.items = [];
		this.memoryPool.wipeAll();

		// Clear auto-lock timer
		if (this.autoLockTimer) {
			clearTimeout(this.autoLockTimer);
			this.autoLockTimer = null;
		}

		// The encrypt function now returns a base64 string with salt+iv+data combined
		return {
			salt: "", // Not needed as it's embedded in data
			iv: "", // Not needed as it's embedded in data
			data: encryptedData,
			version: this.vault.version,
		};
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
		this.resetAutoLock(); // Reset timer on activity

		const index = this.vault.items.findIndex((item) => item.id === id);
		if (index === -1) return null;

		const updatedItem = {
			...this.vault.items[index],
			...updates,
			id, // Preserve original ID
			updatedAt: new Date().toISOString(),
		};

		this.vault.items[index] = updatedItem;
		return updatedItem;
	}

	deleteItem(id: string): boolean {
		this.resetAutoLock(); // Reset timer on activity

		const index = this.vault.items.findIndex((item) => item.id === id);
		if (index === -1) return false;

		this.vault.items.splice(index, 1);
		return true;
	}

	getItem(id: string): VaultItem | null {
		this.resetAutoLock(); // Reset timer on activity
		return this.vault.items.find((item) => item.id === id) || null;
	}

	getAllItems(): VaultItem[] {
		this.resetAutoLock(); // Reset timer on activity
		return [...this.vault.items];
	}

	searchItems(query: string): VaultItem[] {
		this.resetAutoLock(); // Reset timer on activity

		const lowercaseQuery = query.toLowerCase();
		return this.vault.items.filter(
			(item) =>
				item.name.toLowerCase().includes(lowercaseQuery) ||
				item.username?.toLowerCase().includes(lowercaseQuery) ||
				item.url?.toLowerCase().includes(lowercaseQuery) ||
				item.notes?.toLowerCase().includes(lowercaseQuery),
		);
	}

	isLocked(): boolean {
		return this.masterPassword === null;
	}

	export(): Vault {
		this.resetAutoLock(); // Reset timer on activity
		return { ...this.vault };
	}

	import(vault: Vault): void {
		this.resetAutoLock(); // Reset timer on activity
		this.vault = VaultSchema.parse(vault);
	}

	getSettings() {
		return { ...this.vault.settings };
	}

	updateSettings(settings: Partial<Vault["settings"]>) {
		this.vault.settings = { ...this.vault.settings, ...settings };
	}
}
