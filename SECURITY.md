# Security Architecture

## Data Storage & Memory Management

### When Vault is Locked
- **Storage**: Only encrypted data (`EncryptedVault`) is persisted
  - Browser: `browser.storage.local` 
  - Mobile: `AsyncStorage` / `SecureStore`
  - Web: IndexedDB
- **Format**: Base64-encoded encrypted blob with salt and IV
- **Memory**: No decrypted data in memory

### When Vault is Unlocked
- **Memory Only**: Decrypted passwords exist only in JavaScript memory
- **Auto-Lock**: Automatic lock after 5 minutes of inactivity
- **Memory Wiping**: Secure memory cleanup on lock:
  - Overwrite sensitive data with random values
  - Clear all references
  - Force garbage collection where possible

### Security Features

#### Encryption
- **Algorithm**: AES-256-GCM
- **Key Derivation**: Argon2id (memory-hard, resistant to GPU attacks)
  - Time cost: 3 iterations
  - Memory: 64MB
  - Parallelism: 4 threads
- **Salt**: Unique 128-bit salt per encryption
- **IV**: Unique 96-bit initialization vector per encryption

#### Memory Protection
- **SecureMemory Class**: 
  - Allocates dedicated memory for sensitive data
  - Triple overwrite with random data before clearing
  - Auto-wipe timers
- **Auto-Lock**: 
  - 5-minute inactivity timeout (configurable)
  - Resets on any vault interaction
  - Clears all decrypted data from memory

#### Git Sync Security
- **What's Synced**: Only the encrypted vault blob
- **Repository Validation**: 
  - Enforces private repositories only
  - Validates repo privacy via GitHub API
- **Zero-Knowledge**: GitHub never sees:
  - Master password
  - Decrypted passwords
  - Encryption keys

### Data Flow

```
User Password → Argon2id → Encryption Key → AES-256-GCM
                                ↓
                        Encrypted Vault Blob
                                ↓
                    Git Repository (Private Only)
```

### Threat Model Protection

✅ **Protected Against**:
- GitHub data breach (data is encrypted)
- Memory dumps (auto-lock and memory wiping)
- Cross-site scripting (Content Security Policy)
- Weak passwords (Argon2id makes brute force expensive)
- Public repository exposure (enforced private repos)

⚠️ **Considerations**:
- Physical device access while unlocked
- Keyloggers on the device
- Compromised browser/OS
- Weak master password (user responsibility)

### Best Practices for Users

1. **Use a strong master password** (20+ characters recommended)
2. **Enable biometric unlock** on mobile devices
3. **Keep auto-lock enabled** (default 5 minutes)
4. **Only sync to repositories you control**
5. **Regularly audit repository access** on GitHub
6. **Enable 2FA** on your GitHub account

### Reporting Security Issues

If you discover a security vulnerability:
1. DO NOT open a public issue
2. Email: security@bitterwarden.app
3. Include: Description, steps to reproduce, impact assessment
4. You'll receive confirmation within 48 hours