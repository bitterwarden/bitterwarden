import {
	type EncryptedVault,
	type VaultItem,
	VaultService,
} from "@bitterwarden/core";
import { create } from "zustand";
import { biometricAuth } from "@/lib/biometric";
import { storage } from "@/lib/storage";

interface VaultState {
	isLocked: boolean;
	isLoading: boolean;
	items: VaultItem[];
	error: string | null;
	vaultService: VaultService | null;
	biometricEnabled: boolean;

	initialize: () => Promise<void>;
	unlock: (masterPassword: string) => Promise<boolean>;
	unlockWithBiometric: () => Promise<boolean>;
	lock: () => Promise<void>;
	addItem: (
		item: Omit<VaultItem, "id" | "createdAt" | "updatedAt" | "lastUsed">,
	) => Promise<void>;
	updateItem: (id: string, updates: Partial<VaultItem>) => Promise<void>;
	deleteItem: (id: string) => Promise<void>;
	searchItems: (query: string) => VaultItem[];
	enableBiometric: (masterPassword: string) => Promise<void>;
	disableBiometric: () => Promise<void>;
}

export const useVaultStore = create<VaultState>((set, get) => ({
	isLocked: true,
	isLoading: false,
	items: [],
	error: null,
	vaultService: null,
	biometricEnabled: false,

	initialize: async () => {
		set({ isLoading: true, error: null });
		try {
			const service = new VaultService();
			const biometricKey = await biometricAuth.getBiometricKey();
			const biometricAvailable = await biometricAuth.isAvailable();

			set({
				vaultService: service,
				isLoading: false,
				biometricEnabled: !!biometricKey && biometricAvailable,
			});
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : "Failed to initialize vault",
				isLoading: false,
			});
		}
	},

	unlock: async (masterPassword: string) => {
		const { vaultService } = get();
		if (!vaultService) {
			set({ error: "Vault not initialized" });
			return false;
		}

		set({ isLoading: true, error: null });
		try {
			// Try to load encrypted vault from storage
			const vaultData = await storage.getVault();
			let encryptedVault: EncryptedVault | undefined;

			if (vaultData) {
				try {
					encryptedVault = JSON.parse(vaultData) as EncryptedVault;
				} catch {
					// Invalid vault data
				}
			}

			await vaultService.unlock(masterPassword, encryptedVault);
			const items = vaultService.getAllItems();

			set({
				isLocked: false,
				items,
				isLoading: false,
			});
			return true;
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : "Invalid password",
				isLoading: false,
			});
			return false;
		}
	},

	unlockWithBiometric: async () => {
		const { biometricEnabled } = get();
		if (!biometricEnabled) {
			set({ error: "Biometric authentication not enabled" });
			return false;
		}

		set({ isLoading: true, error: null });
		try {
			const authenticated = await biometricAuth.authenticate();
			if (!authenticated) {
				set({ isLoading: false });
				return false;
			}

			const key = await biometricAuth.getBiometricKey();
			if (!key) {
				set({ error: "Biometric key not found", isLoading: false });
				return false;
			}

			return await get().unlock(key);
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : "Biometric unlock failed",
				isLoading: false,
			});
			return false;
		}
	},

	lock: async () => {
		const { vaultService } = get();
		if (vaultService) {
			const encryptedVault = await vaultService.lock();
			if (encryptedVault) {
				await storage.saveVault(JSON.stringify(encryptedVault));
			}
		}
		set({ isLocked: true, items: [] });
	},

	addItem: async (item) => {
		const { vaultService, isLocked } = get();
		if (!vaultService || isLocked) {
			set({ error: "Vault is locked" });
			return;
		}

		set({ isLoading: true, error: null });
		try {
			const newItem = vaultService.addItem(item);
			// Save the encrypted vault
			const encryptedVault = await vaultService.lock();
			if (encryptedVault) {
				await storage.saveVault(JSON.stringify(encryptedVault));
				// Re-unlock after saving
				const vaultData = await storage.getVault();
				if (vaultData) {
					const encrypted = JSON.parse(vaultData) as EncryptedVault;
					await vaultService.unlock(
						(await storage.getMasterKeyHash()) || "",
						encrypted,
					);
				}
			}

			set((state) => ({
				items: [...state.items, newItem],
				isLoading: false,
			}));
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : "Failed to add item",
				isLoading: false,
			});
		}
	},

	updateItem: async (id, updates) => {
		const { vaultService, isLocked } = get();
		if (!vaultService || isLocked) {
			set({ error: "Vault is locked" });
			return;
		}

		set({ isLoading: true, error: null });
		try {
			const updatedItem = vaultService.updateItem(id, updates);
			if (!updatedItem) {
				throw new Error("Item not found");
			}
			// Save the encrypted vault
			const encryptedVault = await vaultService.lock();
			if (encryptedVault) {
				await storage.saveVault(JSON.stringify(encryptedVault));
				// Re-unlock after saving
				const vaultData = await storage.getVault();
				if (vaultData) {
					const encrypted = JSON.parse(vaultData) as EncryptedVault;
					await vaultService.unlock(
						(await storage.getMasterKeyHash()) || "",
						encrypted,
					);
				}
			}

			set((state) => ({
				items: state.items.map((item) => (item.id === id ? updatedItem : item)),
				isLoading: false,
			}));
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : "Failed to update item",
				isLoading: false,
			});
		}
	},

	deleteItem: async (id) => {
		const { vaultService, isLocked } = get();
		if (!vaultService || isLocked) {
			set({ error: "Vault is locked" });
			return;
		}

		set({ isLoading: true, error: null });
		try {
			const success = vaultService.deleteItem(id);
			if (!success) {
				throw new Error("Failed to delete item");
			}
			// Save the encrypted vault
			const encryptedVault = await vaultService.lock();
			if (encryptedVault) {
				await storage.saveVault(JSON.stringify(encryptedVault));
				// Re-unlock after saving
				const vaultData = await storage.getVault();
				if (vaultData) {
					const encrypted = JSON.parse(vaultData) as EncryptedVault;
					await vaultService.unlock(
						(await storage.getMasterKeyHash()) || "",
						encrypted,
					);
				}
			}

			set((state) => ({
				items: state.items.filter((item) => item.id !== id),
				isLoading: false,
			}));
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : "Failed to delete item",
				isLoading: false,
			});
		}
	},

	searchItems: (query) => {
		const { items } = get();
		const lowercaseQuery = query.toLowerCase();

		return items.filter(
			(item) =>
				item.name.toLowerCase().includes(lowercaseQuery) ||
				item.username?.toLowerCase().includes(lowercaseQuery) ||
				item.url?.toLowerCase().includes(lowercaseQuery) ||
				item.notes?.toLowerCase().includes(lowercaseQuery),
		);
	},

	enableBiometric: async (masterPassword) => {
		const isAvailable = await biometricAuth.isAvailable();
		if (!isAvailable) {
			set({ error: "Biometric authentication not available" });
			return;
		}

		try {
			const authenticated = await biometricAuth.authenticate(
				"Enable biometric unlock",
			);
			if (!authenticated) return;

			await biometricAuth.saveBiometricKey(masterPassword);
			set({ biometricEnabled: true });
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : "Failed to enable biometric",
			});
		}
	},

	disableBiometric: async () => {
		try {
			await biometricAuth.clearBiometricKey();
			set({ biometricEnabled: false });
		} catch (error) {
			set({
				error:
					error instanceof Error
						? error.message
						: "Failed to disable biometric",
			});
		}
	},
}));
