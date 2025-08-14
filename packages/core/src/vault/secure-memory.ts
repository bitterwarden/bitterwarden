/**
 * SecureMemory class to handle sensitive data in memory
 * Implements memory cleanup and protection strategies
 */
export class SecureMemory {
	private data: Uint8Array | null = null;

	constructor(size: number) {
		// Allocate memory for sensitive data
		this.data = new Uint8Array(size);
	}

	/**
	 * Write string data to secure memory
	 */
	writeString(value: string, offset: number = 0): void {
		if (!this.data) throw new Error("Memory has been wiped");

		const encoder = new TextEncoder();
		const encoded = encoder.encode(value);

		for (let i = 0; i < encoded.length && offset + i < this.data.length; i++) {
			this.data[offset + i] = encoded[i];
		}
	}

	/**
	 * Read string data from secure memory
	 */
	readString(offset: number = 0, length?: number): string {
		if (!this.data) throw new Error("Memory has been wiped");

		const decoder = new TextDecoder();
		const end = length ? offset + length : this.data.length;
		return decoder.decode(this.data.slice(offset, end));
	}

	/**
	 * Securely wipe memory
	 * Overwrites with random data multiple times before clearing
	 */
	wipe(): void {
		if (!this.data) return;

		// Overwrite with random data 3 times
		for (let pass = 0; pass < 3; pass++) {
			crypto.getRandomValues(this.data);
		}

		// Final overwrite with zeros
		this.data.fill(0);

		// Clear references
		this.data = null;
	}

	/**
	 * Auto-wipe after timeout
	 */
	setAutoWipe(milliseconds: number): void {
		setTimeout(() => this.wipe(), milliseconds);
	}
}

/**
 * Memory pool for managing multiple secure memory allocations
 */
export class SecureMemoryPool {
	private allocations: Set<SecureMemory> = new Set();
	private autoLockTimeout: number = 5 * 60 * 1000; // 5 minutes default

	allocate(size: number): SecureMemory {
		const memory = new SecureMemory(size);
		this.allocations.add(memory);
		memory.setAutoWipe(this.autoLockTimeout);
		return memory;
	}

	/**
	 * Wipe all allocated memory
	 */
	wipeAll(): void {
		for (const memory of this.allocations) {
			memory.wipe();
		}
		this.allocations.clear();
	}

	setAutoLockTimeout(milliseconds: number): void {
		this.autoLockTimeout = milliseconds;
	}
}
