# Bitterwarden

An offline-first password manager with Git sync capabilities. Your passwords stay encrypted on your device, with optional sync to private GitHub repositories.

## Features

- 🔒 **Offline-First**: All data encrypted locally, works without internet
- 🔐 **End-to-End Encryption**: Military-grade encryption using WebCrypto API
- 🔄 **Git Sync**: Optional sync with private GitHub/GitLab repositories
- 📱 **Cross-Platform**: Browser extension, iOS, Android, and web apps
- 🚫 **Privacy-First**: Only private repositories allowed, no telemetry
- 🎯 **Zero-Knowledge**: We never see your passwords or master key

## Project Structure

This is a monorepo managed with Turborepo and Bun:

```
bitterwarden/
├── packages/
│   ├── core/          # Shared business logic (encryption, vault, sync)
│   ├── ui/            # Shared React components
│   └── config/        # Shared configurations
├── apps/
│   ├── extension/     # Browser extension (Chrome, Firefox, Edge)
│   ├── mobile/        # React Native app (iOS & Android)
│   └── web/           # Next.js web vault
└── scripts/           # Build and deployment scripts
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0.0
- Node.js >= 18 (for some dependencies)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/bitterwarden.git
cd bitterwarden

# Install dependencies
bun install

# Build all packages
bun run build
```

### Development

```bash
# Run all apps in development mode
bun run dev

# Run specific app
cd apps/extension && bun run dev
cd apps/mobile && bun run start
cd apps/web && bun run dev
```

## Security

- **Encryption**: AES-256-GCM with Argon2id key derivation
- **Private Repos Only**: GitHub sync enforces private repository requirement
- **Local First**: All encryption happens on-device before any sync
- **Zero Trust**: No server-side decryption capabilities

## Building for Production

### Browser Extension

```bash
bun run scripts/build-extension.ts
# Output: dist/bitterwarden-chrome.zip
```

### Mobile Apps

```bash
cd apps/mobile
bun run build:ios
bun run build:android
```

### Web App

```bash
cd apps/web
bun run build
bun run start
```

## Configuration

### GitHub OAuth

For GitHub sync, you'll need to set up OAuth:

1. Create a GitHub OAuth App
2. Set environment variables:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

### Custom Git Servers

Support for custom Git servers (GitLab, Gitea, etc.) coming soon.

## License

MIT

## Security Disclosure

If you discover a security vulnerability, please email security@bitterwarden.app