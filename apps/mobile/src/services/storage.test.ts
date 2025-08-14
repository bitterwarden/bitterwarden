import { beforeEach, describe, expect, it, mock } from "bun:test";

// Create mock functions that can be updated
const mockAsyncStorageGetItem = mock(() => Promise.resolve(null));
const mockAsyncStorageSetItem = mock(() => Promise.resolve());
const mockAsyncStorageRemoveItem = mock(() => Promise.resolve());

const mockSecureStoreGetItemAsync = mock(() => Promise.resolve(null));
const mockSecureStoreSetItemAsync = mock(() => Promise.resolve());
const mockSecureStoreDeleteItemAsync = mock(() => Promise.resolve());

// Mock the entire modules before importing
mock.module("@react-native-async-storage/async-storage", () => ({
	default: {
		getItem: mockAsyncStorageGetItem,
		setItem: mockAsyncStorageSetItem,
		removeItem: mockAsyncStorageRemoveItem,
		clear: mock(() => Promise.resolve()),
	},
}));

mock.module("expo-secure-store", () => ({
	getItemAsync: mockSecureStoreGetItemAsync,
	setItemAsync: mockSecureStoreSetItemAsync,
	deleteItemAsync: mockSecureStoreDeleteItemAsync,
}));

describe("SecureStorageService", () => {
	beforeEach(() => {
		// Reset mocks before each test
		mockAsyncStorageGetItem.mockClear();
		mockAsyncStorageSetItem.mockClear();
		mockAsyncStorageRemoveItem.mockClear();
		mockSecureStoreGetItemAsync.mockClear();
		mockSecureStoreSetItemAsync.mockClear();
		mockSecureStoreDeleteItemAsync.mockClear();
	});

	it("should handle vault operations", async () => {
		// Import after mocking
		const { SecureStorageService } = await import("./storage");

		const service = new SecureStorageService();
		const encryptedVault = {
			salt: "test-salt",
			iv: "test-iv",
			data: "encrypted-data",
			version: 1,
		};

		// Test save
		await service.saveVault(encryptedVault);
		expect(mockAsyncStorageSetItem).toHaveBeenCalledWith(
			"@bitterwarden/vault",
			JSON.stringify(encryptedVault),
		);

		// Test load - update mock implementation
		mockAsyncStorageGetItem.mockImplementation(() =>
			Promise.resolve(JSON.stringify(encryptedVault)),
		);
		const result = await service.getVault();
		expect(result).toEqual(encryptedVault);

		// Test clear
		await service.clearVault();
		expect(mockAsyncStorageRemoveItem).toHaveBeenCalledWith(
			"@bitterwarden/vault",
		);
	});

	it("should handle secure store operations", async () => {
		const { SecureStorageService } = await import("./storage");

		const service = new SecureStorageService();

		// Test save password hash
		await service.saveMasterPasswordHash("hash123");
		expect(mockSecureStoreSetItemAsync).toHaveBeenCalledWith(
			"@bitterwarden/master-hash",
			"hash123",
		);

		// Test get password hash - update mock implementation
		mockSecureStoreGetItemAsync.mockImplementation(() =>
			Promise.resolve("hash123"),
		);
		const hash = await service.getMasterPasswordHash();
		expect(hash).toBe("hash123");
		expect(mockSecureStoreGetItemAsync).toHaveBeenCalledWith(
			"@bitterwarden/master-hash",
		);
	});

	it("should check if vault exists", async () => {
		const { SecureStorageService } = await import("./storage");

		const service = new SecureStorageService();

		// When vault exists
		mockAsyncStorageGetItem.mockImplementation(() => Promise.resolve("{}"));
		let exists = await service.hasVault();
		expect(exists).toBe(true);

		// When vault doesn't exist
		mockAsyncStorageGetItem.mockImplementation(() => Promise.resolve(null));
		exists = await service.hasVault();
		expect(exists).toBe(false);
	});
});
