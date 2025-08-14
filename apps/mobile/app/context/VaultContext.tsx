import React, { createContext, useContext, useState, ReactNode } from "react";

interface VaultItem {
	id: string;
	name: string;
	username?: string;
	password: string;
}

interface VaultContextType {
	isLocked: boolean;
	items: VaultItem[];
	unlock: (password: string) => boolean;
	lock: () => void;
	addItem: (item: Omit<VaultItem, "id">) => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

// Some fake initial data
const INITIAL_ITEMS: VaultItem[] = [
	{ id: "1", name: "GitHub", username: "user@example.com", password: "secret123" },
	{ id: "2", name: "Google", username: "user@gmail.com", password: "secret456" },
	{ id: "3", name: "Amazon", username: "shopper@example.com", password: "secret789" },
];

export function VaultProvider({ children }: { children: ReactNode }) {
	const [isLocked, setIsLocked] = useState(true);
	const [items, setItems] = useState<VaultItem[]>(INITIAL_ITEMS);

	const unlock = (password: string): boolean => {
		// For now, accept any password
		if (password) {
			setIsLocked(false);
			return true;
		}
		return false;
	};

	const lock = () => {
		setIsLocked(true);
	};

	const addItem = (item: Omit<VaultItem, "id">) => {
		const newItem = {
			...item,
			id: Date.now().toString(),
		};
		setItems([...items, newItem]);
	};

	return (
		<VaultContext.Provider value={{ isLocked, items, unlock, lock, addItem }}>
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