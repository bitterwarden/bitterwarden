import * as argon2 from 'argon2-browser';

export class CryptoService {
  private static encoder = new TextEncoder();
  private static decoder = new TextDecoder();

  static async deriveKey(
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    const hashResult = await argon2.hash({
      pass: password,
      salt,
      time: 3,
      mem: 65536,
      hashLen: 32,
      parallelism: 4,
      type: argon2.ArgonType.Argon2id,
    });

    return crypto.subtle.importKey(
      'raw',
      hashResult.hash,
      { name: 'AES-GCM' },
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
      { name: 'AES-GCM', iv },
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
    const result = await argon2.hash({
      pass: password,
      salt,
      time: 3,
      mem: 65536,
      hashLen: 32,
      parallelism: 4,
      type: argon2.ArgonType.Argon2id,
    });

    return `${Buffer.from(salt).toString('base64')}:${Buffer.from(
      result.hash
    ).toString('base64')}`;
  }

  static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    const [saltBase64, hashBase64] = hash.split(':');
    const salt = Buffer.from(saltBase64, 'base64');
    const expectedHash = Buffer.from(hashBase64, 'base64');

    const result = await argon2.hash({
      pass: password,
      salt: new Uint8Array(salt),
      time: 3,
      mem: 65536,
      hashLen: 32,
      parallelism: 4,
      type: argon2.ArgonType.Argon2id,
    });

    return Buffer.from(result.hash).equals(expectedHash);
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