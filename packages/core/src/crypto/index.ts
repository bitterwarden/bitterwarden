export class CryptoService {
  private static encoder = new TextEncoder();
  private static decoder = new TextDecoder();

  private static toArrayBuffer(buffer: Uint8Array): ArrayBuffer {
    // Create a new ArrayBuffer with the same content
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    view.set(buffer);
    return arrayBuffer;
  }

  static async deriveKey(
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    // Use PBKDF2 for now, can switch to Argon2 later with proper WASM setup
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: this.toArrayBuffer(salt),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static async encrypt(
    data: string,
    key: CryptoKey
  ): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = this.encoder.encode(data);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    return { encrypted, iv };
  }

  static async decrypt(
    encrypted: ArrayBuffer,
    key: CryptoKey,
    iv: Uint8Array
  ): Promise<string> {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: this.toArrayBuffer(iv) },
      key,
      encrypted
    );

    return this.decoder.decode(decrypted);
  }

  static generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(16));
  }

  static async hashPassword(password: string): Promise<string> {
    const salt = this.generateSalt();
    const key = await this.deriveKey(password, salt);
    const exported = await crypto.subtle.exportKey('raw', key);
    const hashBuffer = new Uint8Array(exported);

    return `${Buffer.from(salt).toString('base64')}:${Buffer.from(
      hashBuffer
    ).toString('base64')}`;
  }

  static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    const [saltBase64, hashBase64] = hash.split(':');
    const salt = Buffer.from(saltBase64, 'base64');
    const expectedHash = Buffer.from(hashBase64, 'base64');

    const key = await this.deriveKey(password, new Uint8Array(salt));
    const exported = await crypto.subtle.exportKey('raw', key);
    const actualHash = new Uint8Array(exported);

    return Buffer.from(actualHash).equals(expectedHash);
  }

  static generatePassword(
    length: number = 20,
    options: {
      uppercase?: boolean;
      lowercase?: boolean;
      numbers?: boolean;
      symbols?: boolean;
    } = {}
  ): string {
    const defaults = {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    };
    const opts = { ...defaults, ...options };

    let charset = '';
    if (opts.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (opts.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (opts.numbers) charset += '0123456789';
    if (opts.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz';

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }

    return password;
  }
}