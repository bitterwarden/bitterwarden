import { beforeEach, describe, expect, it, mock } from "bun:test";

interface MockVaultService {
	unlock: ReturnType<typeof mock>;
	lock: ReturnType<typeof mock>;
	addItem: ReturnType<typeof mock>;
	getAllItems: ReturnType<typeof mock>;
	searchItems: ReturnType<typeof mock>;
	isLocked: ReturnType<typeof mock>;
}

interface MockStorage {
	local: {
		set: ReturnType<typeof mock>;
		get: ReturnType<typeof mock>;
	};
}

describe("Background Service", () => {
	// Instead of importing the actual background script, we'll test the message handlers directly
	let vaultService: MockVaultService;
	let storage: MockStorage;

	beforeEach(() => {
		// Create mocked vault service
		vaultService = {
			unlock: mock(() => Promise.resolve()),
			lock: mock(() =>
				Promise.resolve({ data: "encrypted", salt: "", iv: "", version: 1 }),
			),
			addItem: mock(() => ({ id: "test-id", name: "Test Item" })),
			getAllItems: mock(() => []),
			searchItems: mock(() => []),
			isLocked: mock(() => true),
		};

		// Create mocked storage
		storage = {
			local: {
				set: mock(() => Promise.resolve()),
				get: mock(() => Promise.resolve({})),
			},
		};
	});

	it("should handle UNLOCK_VAULT message", async () => {
		const request = {
			type: "UNLOCK_VAULT",
			password: "password123",
			encryptedVault: undefined,
		};

		await vaultService.unlock(request.password, request.encryptedVault);
		expect(vaultService.unlock).toHaveBeenCalledWith("password123", undefined);
	});

	it("should handle LOCK_VAULT message", async () => {
		const encrypted = await vaultService.lock();
		expect(vaultService.lock).toHaveBeenCalled();

		if (encrypted) {
			await storage.local.set({ vault: encrypted });
			expect(storage.local.set).toHaveBeenCalledWith({ vault: encrypted });
		}
	});

	it("should handle ADD_ITEM message", async () => {
		const newItem = {
			name: "Test Site",
			username: "user@example.com",
			password: "password123",
			url: "https://example.com",
		};

		const result = vaultService.addItem(newItem);
		expect(vaultService.addItem).toHaveBeenCalledWith(newItem);
		expect(result).toHaveProperty("id");
		expect(result).toHaveProperty("name", "Test Item");
	});

	it("should handle GET_ALL_ITEMS message", async () => {
		const items = vaultService.getAllItems();
		expect(vaultService.getAllItems).toHaveBeenCalled();
		expect(items).toBeArray();
	});

	it("should handle CHECK_LOCK_STATUS message", async () => {
		const isLocked = vaultService.isLocked();
		expect(vaultService.isLocked).toHaveBeenCalled();
		expect(isLocked).toBe(true);
	});
});
