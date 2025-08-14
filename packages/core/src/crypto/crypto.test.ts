import { describe, expect, it } from "bun:test";
import {
	decrypt,
	deriveKey,
	encrypt,
	generatePassword,
	generateSalt,
} from "./index";

describe("Crypto Functions", () => {
	describe("generateSalt", () => {
		it("should generate a salt of 16 bytes", () => {
			const salt = generateSalt();
			expect(salt).toBeInstanceOf(Uint8Array);
			expect(salt.length).toBe(16);
		});

		it("should generate different salts each time", () => {
			const salt1 = generateSalt();
			const salt2 = generateSalt();
			expect(salt1).not.toEqual(salt2);
		});
	});

	describe("generatePassword", () => {
		it("should generate a password of default length 20", () => {
			const password = generatePassword();
			expect(password).toBeString();
			expect(password.length).toBe(20);
		});

		it("should generate a password of specified length", () => {
			const password = generatePassword(32);
			expect(password.length).toBe(32);
		});

		it("should generate different passwords each time", () => {
			const password1 = generatePassword();
			const password2 = generatePassword();
			expect(password1).not.toBe(password2);
		});

		it("should only contain valid characters", () => {
			const password = generatePassword(100);
			const validChars = /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|;:,.<>?]+$/;
			expect(password).toMatch(validChars);
		});
	});

	describe("deriveKey", () => {
		it("should derive a CryptoKey from password and salt", async () => {
			const password = "testPassword123";
			const salt = generateSalt();
			const key = await deriveKey(password, salt);

			expect(key).toBeInstanceOf(CryptoKey);
			expect(key.type).toBe("secret");
			expect(key.algorithm.name).toBe("AES-GCM");
		});

		it("should derive same key for same password and salt", async () => {
			const password = "testPassword123";
			const salt = generateSalt();

			const key1 = await deriveKey(password, salt);
			const key2 = await deriveKey(password, salt);

			// Keys are non-extractable, but we can verify they work the same
			// by encrypting data with both and checking results
			const testData = new TextEncoder().encode("test data");
			const iv = new Uint8Array(12);

			const encrypted1 = await crypto.subtle.encrypt(
				{ name: "AES-GCM", iv },
				key1,
				testData,
			);

			const encrypted2 = await crypto.subtle.encrypt(
				{ name: "AES-GCM", iv },
				key2,
				testData,
			);

			// Same key with same IV should produce same ciphertext
			expect(new Uint8Array(encrypted1)).toEqual(new Uint8Array(encrypted2));
		});
	});

	describe("encrypt and decrypt", () => {
		it("should encrypt and decrypt a string correctly", async () => {
			const originalData = "This is a secret message!";
			const password = "mySecretPassword123";

			const encrypted = await encrypt(originalData, password);
			expect(encrypted).toBeString();
			expect(encrypted).not.toBe(originalData);

			const decrypted = await decrypt(encrypted, password);
			expect(decrypted).toBe(originalData);
		});

		it("should produce different encrypted results for same data", async () => {
			const originalData = "Same message";
			const password = "mySecretPassword123";

			const encrypted1 = await encrypt(originalData, password);
			const encrypted2 = await encrypt(originalData, password);

			expect(encrypted1).not.toBe(encrypted2);

			// But both should decrypt to same value
			const decrypted1 = await decrypt(encrypted1, password);
			const decrypted2 = await decrypt(encrypted2, password);

			expect(decrypted1).toBe(originalData);
			expect(decrypted2).toBe(originalData);
		});

		it("should fail to decrypt with wrong password", async () => {
			const originalData = "Secret data";
			const password = "correctPassword";
			const wrongPassword = "wrongPassword";

			const encrypted = await encrypt(originalData, password);

			await expect(decrypt(encrypted, wrongPassword)).rejects.toThrow();
		});

		it("should handle special characters and unicode", async () => {
			const originalData = "Special chars: 😀🎉 ñ é ü 中文";
			const password = "unicodePassword";

			const encrypted = await encrypt(originalData, password);
			const decrypted = await decrypt(encrypted, password);

			expect(decrypted).toBe(originalData);
		});

		it("should handle empty strings", async () => {
			const originalData = "";
			const password = "password";

			const encrypted = await encrypt(originalData, password);
			const decrypted = await decrypt(encrypted, password);

			expect(decrypted).toBe(originalData);
		});

		it("should handle very long strings", async () => {
			const originalData = "x".repeat(10000);
			const password = "password";

			const encrypted = await encrypt(originalData, password);
			const decrypted = await decrypt(encrypted, password);

			expect(decrypted).toBe(originalData);
		});
	});
});
