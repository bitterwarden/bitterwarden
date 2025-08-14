import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const VAULT_KEY = "@bitterwarden:vault";
const SETTINGS_KEY = "@bitterwarden:settings";
const MASTER_KEY = "@bitterwarden:master_key";

export class MobileStorage {
	async getVault(): Promise<string | null> {
		try {
			return await AsyncStorage.getItem(VAULT_KEY);
		} catch (error) {
			console.error("Failed to load vault:", error);
			return null;
		}
	}

	async saveVault(data: string): Promise<void> {
		try {
			await AsyncStorage.setItem(VAULT_KEY, data);
		} catch (error) {
			console.error("Failed to save vault:", error);
			throw error;
		}
	}

	async clearVault(): Promise<void> {
		try {
			await AsyncStorage.removeItem(VAULT_KEY);
		} catch (error) {
			console.error("Failed to clear vault:", error);
		}
	}

	async getMasterKeyHash(): Promise<string | null> {
		try {
			return await SecureStore.getItemAsync(MASTER_KEY);
		} catch (error) {
			console.error("Failed to get master key hash:", error);
			return null;
		}
	}

	async saveMasterKeyHash(hash: string): Promise<void> {
		try {
			await SecureStore.setItemAsync(MASTER_KEY, hash);
		} catch (error) {
			console.error("Failed to save master key hash:", error);
			throw error;
		}
	}

	async clearMasterKeyHash(): Promise<void> {
		try {
			await SecureStore.deleteItemAsync(MASTER_KEY);
		} catch (error) {
			console.error("Failed to clear master key hash:", error);
		}
	}

	async getSettings(): Promise<Record<string, unknown> | null> {
		try {
			const data = await AsyncStorage.getItem(SETTINGS_KEY);
			return data ? JSON.parse(data) : null;
		} catch (error) {
			console.error("Failed to load settings:", error);
			return null;
		}
	}

	async saveSettings(settings: Record<string, unknown>): Promise<void> {
		try {
			await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
		} catch (error) {
			console.error("Failed to save settings:", error);
			throw error;
		}
	}
}

export const storage = new MobileStorage();
