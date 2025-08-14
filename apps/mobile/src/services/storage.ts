import type { EncryptedVault } from "@bitterwarden/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const VAULT_KEY = "@bitterwarden/vault";
const MASTER_HASH_KEY = "@bitterwarden/master-hash";

export class SecureStorageService {
	async saveVault(vault: EncryptedVault): Promise<void> {
		await AsyncStorage.setItem(VAULT_KEY, JSON.stringify(vault));
	}

	async getVault(): Promise<EncryptedVault | null> {
		const data = await AsyncStorage.getItem(VAULT_KEY);
		return data ? JSON.parse(data) : null;
	}

	async clearVault(): Promise<void> {
		await AsyncStorage.removeItem(VAULT_KEY);
	}

	async saveMasterPasswordHash(hash: string): Promise<void> {
		await SecureStore.setItemAsync(MASTER_HASH_KEY, hash);
	}

	async getMasterPasswordHash(): Promise<string | null> {
		return await SecureStore.getItemAsync(MASTER_HASH_KEY);
	}

	async hasVault(): Promise<boolean> {
		const vault = await AsyncStorage.getItem(VAULT_KEY);
		return vault !== null;
	}

	async clearAll(): Promise<void> {
		await this.clearVault();
		await SecureStore.deleteItemAsync(MASTER_HASH_KEY);
	}
}
