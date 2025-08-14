const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toArrayBuffer(buffer: Uint8Array): ArrayBuffer {
	// Create a new ArrayBuffer with the same content
	const arrayBuffer = new ArrayBuffer(buffer.length);
	const view = new Uint8Array(arrayBuffer);
	view.set(buffer);
	return arrayBuffer;
}

export async function deriveKey(
	password: string,
	salt: Uint8Array,
): Promise<CryptoKey> {
	// Use PBKDF2 for now, can switch to Argon2 later with proper WASM setup
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		encoder.encode(password),
		"PBKDF2",
		false,
		["deriveBits", "deriveKey"],
	);

	return crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt: toArrayBuffer(salt),
			iterations: 100000,
			hash: "SHA-256",
		},
		keyMaterial,
		{ name: "AES-GCM", length: 256 },
		false,
		["encrypt", "decrypt"],
	);
}

export async function encryptWithKey(
	data: string,
	key: CryptoKey,
): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encoded = encoder.encode(data);

	const encrypted = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv: toArrayBuffer(iv) },
		key,
		encoded,
	);

	return { encrypted, iv };
}

export async function decryptWithKey(
	encryptedData: ArrayBuffer,
	key: CryptoKey,
	iv: Uint8Array,
): Promise<string> {
	const decrypted = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: toArrayBuffer(iv) },
		key,
		encryptedData,
	);

	return decoder.decode(decrypted);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes.buffer;
}

export async function encrypt(data: string, password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const key = await deriveKey(password, salt);
	const iv = crypto.getRandomValues(new Uint8Array(12));

	const encrypted = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv: toArrayBuffer(iv) },
		key,
		encoder.encode(data),
	);

	// Combine salt + iv + encrypted data
	const combined = new Uint8Array(
		salt.length + iv.length + encrypted.byteLength,
	);
	combined.set(salt, 0);
	combined.set(iv, salt.length);
	combined.set(new Uint8Array(encrypted), salt.length + iv.length);

	return arrayBufferToBase64(toArrayBuffer(combined));
}

export async function decrypt(
	encryptedDataBase64: string,
	password: string,
): Promise<string> {
	const encryptedData = base64ToArrayBuffer(encryptedDataBase64);
	const data = new Uint8Array(encryptedData);

	// Extract salt, iv, and encrypted content
	const salt = data.slice(0, 16);
	const iv = data.slice(16, 28);
	const encrypted = data.slice(28);

	const key = await deriveKey(password, salt);

	const dataArrayBuffer = new ArrayBuffer(encrypted.length);
	const dataView = new Uint8Array(dataArrayBuffer);
	dataView.set(encrypted);

	const decrypted = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: toArrayBuffer(iv) },
		key,
		dataArrayBuffer,
	);

	return decoder.decode(decrypted);
}

export function generateSalt(): Uint8Array {
	return crypto.getRandomValues(new Uint8Array(16));
}

export function generatePassword(length = 20): string {
	const charset =
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
	const array = new Uint32Array(length);
	crypto.getRandomValues(array);

	let password = "";
	for (let i = 0; i < length; i++) {
		password += charset[array[i] % charset.length];
	}

	return password;
}
