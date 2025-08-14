# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bitterwarden is a security-focused, offline-first password manager with browser extension and mobile app support. It uses end-to-end encryption and optional Git synchronization.

## Essential Commands

### Development
```bash
bun run dev                # Start all apps in development mode
bun run dev:extension      # Start browser extension only
bun run dev:mobile         # Start mobile app only
```

### Building
```bash
bun run build              # Build all packages and apps
bun run build:extension    # Build browser extension
bun run build:mobile       # Build mobile app
```

### Testing & Quality
```bash
bun run test               # Run all tests with coverage
bun run test:watch         # Run tests in watch mode
bun run check              # Run Biome linting and formatting
bun run check:fix          # Fix Biome issues automatically
bun run typecheck          # Run TypeScript type checking
```

### Running a Single Test
```bash
bun test path/to/test.test.ts     # Run specific test file
bun test --grep "test name"       # Run tests matching pattern
```

## High-Level Architecture

### Monorepo Structure
- **apps/** - User-facing applications
  - `extension/` - Browser extension (Vite + React + WebExtension APIs)
  - `mobile/` - React Native app with Expo
- **packages/** - Shared libraries
  - `core/` - Business logic, encryption, vault management, Git sync
  - `ui/` - Shared React components (Radix UI + Tailwind)
  - `config/` - Shared TypeScript and build configurations

### Core Architecture Patterns

1. **Encryption Layer** (`packages/core/src/crypto/`)
   - AES-256-GCM encryption with WebCrypto API
   - PBKDF2 key derivation (100,000 iterations)
   - Secure memory management with automatic cleanup
   - All encryption happens on-device (zero-knowledge)

2. **Vault Management** (`packages/core/src/vault/`)
   - `VaultService` class manages encrypted vault state
   - Auto-lock after 5 minutes of inactivity
   - CRUD operations with Zod validation
   - Secure memory pool for sensitive data

3. **Git Synchronization** (`packages/core/src/sync/`)
   - `GitSyncService` using isomorphic-git
   - Private repository enforcement
   - Conflict detection and resolution
   - Platform-agnostic filesystem abstraction

4. **Browser Extension Architecture** (`apps/extension/`)
   - Background service worker (`src/background/`) - Manages vault state
   - Popup UI (`src/popup/`) - React app for user interaction
   - Content scripts (`src/content/`) - Autofill functionality
   - Message passing between components via browser runtime API

5. **Mobile App Architecture** (`apps/mobile/`)
   - Expo Router for file-based navigation
   - Cross-platform components with platform-specific adaptations
   - Native API access through Expo modules

### Key Design Decisions

- **Offline-First**: All functionality works without internet connection
- **Local Encryption**: Data is encrypted before any sync operations
- **Private Git Only**: Sync only allowed with private repositories
- **Monorepo with Turborepo**: Efficient builds with caching and parallelization
- **Bun Runtime**: Fast JavaScript runtime for development and testing
- **Biome for Linting**: Single tool for both linting and formatting

### Security Considerations

- Never log or expose sensitive data (passwords, encryption keys)
- All vault operations must go through `VaultService`
- Git sync requires valid SSH keys or tokens
- Auto-lock mechanism is non-negotiable for security
- Memory containing sensitive data must be explicitly cleared

### Testing Approach

- Unit tests are co-located with source files (`*.test.ts`)
- React components tested with React Testing Library
- Crypto functions have comprehensive test vectors
- Use `bun test` for running tests (built-in test runner)

### Development Tips

- Use workspace imports (`@bitterwarden/core`, `@bitterwarden/ui`)
- Run `bun run check:fix` before committing to fix formatting
- Build packages before apps when making cross-package changes
- Extension development requires Chrome/Edge in developer mode
- Mobile development requires Expo Go app or simulator