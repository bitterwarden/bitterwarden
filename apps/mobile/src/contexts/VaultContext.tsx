import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {
	VaultService,
	type VaultItem,
	type EncryptedVault,
} from "@bitterwarden/core";

interface VaultContextType {
	vault: VaultService | null;
	isUnlocked: boolean;
	items: VaultItem[];
	unlock: (password: string) => Promise<boolean>;
	lock: () => Promise<void>;
	addItem: (item: Omit<VaultItem, "id" | "createdAt" | "updatedAt">) => void;
	updateItem: (id: string, updates: Partial<VaultItem>) => void;
	deleteItem: (id: string) => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
	const [vault] = useState(() => new VaultService());
	const [isUnlocked, setIsUnlocked] = useState(false);
	const [items, setItems] = useState<VaultItem[]>([]);

	useEffect(() => {
		if (isUnlocked) {
			setItems(vault.getAllItems());
		}
	}, [isUnlocked, vault]);

	async function unlock(password: string): Promise<boolean> {
		try {
			const storedVault = await AsyncStorage.getItem("encryptedVault");
			const encryptedVault = storedVault ? JSON.parse(storedVault) : null;

			await vault.unlock(password, encryptedVault);
			await SecureStore.setItemAsync("hasVault", "true");

			setIsUnlocked(true);
			setItems(vault.getAllItems());
			return true;
		} catch (error) {
			console.error("Failed to unlock vault:", error);
			return false;
		}
	}

	async function lock(): Promise<void> {
		const encrypted = await vault.lock();
		if (encrypted) {
			await AsyncStorage.setItem("encryptedVault", JSON.stringify(encrypted));
		}
		setIsUnlocked(false);
		setItems([]);
	}

	function addItem(item: Omit<VaultItem, "id" | "createdAt" | "updatedAt">) {
		const newItem = vault.addItem(item);
		setItems(vault.getAllItems());
	}

	function updateItem(id: string, updates: Partial<VaultItem>) {
		vault.updateItem(id, updates);
		setItems(vault.getAllItems());
	}

	function deleteItem(id: string) {
		vault.deleteItem(id);
		setItems(vault.getAllItems());
	}

	return (
		<VaultContext.Provider
			value={{
				vault,
				isUnlocked,
				items,
				unlock,
				lock,
				addItem,
				updateItem,
				deleteItem,
			}}
		>
			{children}
		</VaultContext.Provider>
	);
}

export function useVault() {
	const context = useContext(VaultContext);
	if (!context) {
		throw new Error("useVault must be used within VaultProvider");
	}
	return context;
}
