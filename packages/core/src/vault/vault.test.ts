import { beforeEach, describe, expect, it } from "bun:test";
import { VaultService } from "./index";

describe("VaultService", () => {
	let vaultService: VaultService;

	beforeEach(() => {
		vaultService = new VaultService();
	});

	describe("lock and unlock", () => {
		it("should start in locked state", () => {
			expect(vaultService.isLocked()).toBe(true);
		});

		it("should unlock with password", async () => {
			await vaultService.unlock("password123");
			expect(vaultService.isLocked()).toBe(false);
		});

		it("should lock and return encrypted vault", async () => {
			await vaultService.unlock("password123");

			const _item = vaultService.addItem({
				name: "Test Item",
				password: "itemPassword",
				tags: ["test"],
			});

			const encrypted = await vaultService.lock();

			expect(encrypted).not.toBeNull();
			expect(encrypted?.data).toBeString();
			expect(encrypted?.version).toBe(1);
			expect(vaultService.isLocked()).toBe(true);
		});

		it("should restore vault from encrypted data", async () => {
			const password = "myPassword";

			// Create and encrypt vault with an item
			await vaultService.unlock(password);
			const _item = vaultService.addItem({
				name: "Test Item",
				password: "itemPassword",
				username: "testuser",
			});
			const encrypted = await vaultService.lock();

			// Create new vault service and unlock with encrypted data
			const newVaultService = new VaultService();
			expect(encrypted).not.toBeNull();
			if (encrypted) {
				await newVaultService.unlock(password, encrypted);
			}

			const items = newVaultService.getAllItems();
			expect(items).toHaveLength(1);
			expect(items[0].name).toBe("Test Item");
			expect(items[0].username).toBe("testuser");
		});
	});

	describe("item management", () => {
		beforeEach(async () => {
			await vaultService.unlock("password123");
		});

		it("should add an item", () => {
			const item = vaultService.addItem({
				name: "GitHub",
				password: "ghPassword123",
				username: "john.doe",
				url: "https://github.com",
				notes: "Personal account",
				tags: ["dev", "personal"],
			});

			expect(item.id).toBeString();
			expect(item.name).toBe("GitHub");
			expect(item.username).toBe("john.doe");
			expect(item.createdAt).toBeString();
			expect(item.updatedAt).toBeString();
		});

		it("should get item by id", () => {
			const item = vaultService.addItem({
				name: "Test",
				password: "pass",
			});

			const retrieved = vaultService.getItem(item.id);
			expect(retrieved).toEqual(item);
		});

		it("should return null for non-existent item", () => {
			const retrieved = vaultService.getItem("non-existent-id");
			expect(retrieved).toBeNull();
		});

		it("should update an item", async () => {
			const item = vaultService.addItem({
				name: "Original",
				password: "pass",
			});

			// Add small delay to ensure updatedAt differs
			await new Promise((resolve) => setTimeout(resolve, 10));

			const updated = vaultService.updateItem(item.id, {
				name: "Updated",
				username: "newuser",
			});

			expect(updated).not.toBeNull();
			expect(updated?.name).toBe("Updated");
			expect(updated?.username).toBe("newuser");
			expect(updated?.password).toBe("pass"); // Unchanged
			expect(updated?.updatedAt).not.toBe(item.updatedAt);
		});

		it("should delete an item", () => {
			const item = vaultService.addItem({
				name: "ToDelete",
				password: "pass",
			});

			const deleted = vaultService.deleteItem(item.id);
			expect(deleted).toBe(true);

			const retrieved = vaultService.getItem(item.id);
			expect(retrieved).toBeNull();
		});

		it("should return false when deleting non-existent item", () => {
			const deleted = vaultService.deleteItem("non-existent");
			expect(deleted).toBe(false);
		});

		it("should get all items", () => {
			vaultService.addItem({ name: "Item1", password: "pass1" });
			vaultService.addItem({ name: "Item2", password: "pass2" });
			vaultService.addItem({ name: "Item3", password: "pass3" });

			const items = vaultService.getAllItems();
			expect(items).toHaveLength(3);
			expect(items.map((i) => i.name)).toEqual(["Item1", "Item2", "Item3"]);
		});

		it("should search items", () => {
			vaultService.addItem({
				name: "GitHub",
				password: "pass",
				username: "github-user",
				url: "https://github.com",
			});
			vaultService.addItem({
				name: "GitLab",
				password: "pass",
				username: "gitlab-user",
				url: "https://gitlab.com",
			});
			vaultService.addItem({
				name: "Bitbucket",
				password: "pass",
				username: "bit-user",
				notes: "Work account for git",
			});

			// Search by name (also finds "git" in notes)
			let results = vaultService.searchItems("git");
			expect(results).toHaveLength(3);
			expect(results.map((i) => i.name).sort()).toEqual([
				"Bitbucket",
				"GitHub",
				"GitLab",
			]);

			// Search by username
			results = vaultService.searchItems("lab-user");
			expect(results).toHaveLength(1);
			expect(results[0].name).toBe("GitLab");

			// Search by notes
			results = vaultService.searchItems("work");
			expect(results).toHaveLength(1);
			expect(results[0].name).toBe("Bitbucket");

			// Case insensitive search
			results = vaultService.searchItems("GITHUB");
			expect(results).toHaveLength(1);
			expect(results[0].name).toBe("GitHub");
		});
	});

	describe("settings", () => {
		beforeEach(async () => {
			await vaultService.unlock("password123");
		});

		it("should get default settings", () => {
			const settings = vaultService.getSettings();
			expect(settings.syncEnabled).toBe(false);
			expect(settings.autoSync).toBe(false);
			expect(settings.syncInterval).toBe(300000);
			expect(settings.gitBranch).toBe("main");
		});

		it("should update settings", () => {
			vaultService.updateSettings({
				syncEnabled: true,
				gitRemote: "https://github.com/user/vault.git",
			});

			const settings = vaultService.getSettings();
			expect(settings.syncEnabled).toBe(true);
			expect(settings.gitRemote).toBe("https://github.com/user/vault.git");
			expect(settings.autoSync).toBe(false); // Unchanged
		});
	});

	describe("export and import", () => {
		beforeEach(async () => {
			await vaultService.unlock("password123");
		});

		it("should export vault data", () => {
			vaultService.addItem({ name: "Item1", password: "pass1" });
			vaultService.addItem({ name: "Item2", password: "pass2" });
			vaultService.updateSettings({ syncEnabled: true });

			const exported = vaultService.export();

			expect(exported.version).toBe(1);
			expect(exported.items).toHaveLength(2);
			expect(exported.settings.syncEnabled).toBe(true);
		});

		it("should import vault data", () => {
			const vaultData = {
				version: 1,
				items: [
					{
						id: "test-id-1",
						name: "Imported Item",
						password: "importedPass",
						tags: ["imported"],
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					},
				],
				settings: {
					syncEnabled: true,
					autoSync: true,
					syncInterval: 600000,
					gitBranch: "main",
					gitRemote: "https://github.com/test/vault.git",
				},
			};

			vaultService.import(vaultData);

			const items = vaultService.getAllItems();
			expect(items).toHaveLength(1);
			expect(items[0].name).toBe("Imported Item");

			const settings = vaultService.getSettings();
			expect(settings.syncEnabled).toBe(true);
			expect(settings.autoSync).toBe(true);
			expect(settings.syncInterval).toBe(600000);
		});
	});
});
