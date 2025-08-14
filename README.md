# 🔐 Bitterwarden

A secure, open-source password manager built as a monorepo supporting browser extension and mobile applications. Your passwords stay encrypted on your device, with optional sync to private Git repositories.

## ✨ Features

- 🔒 **Offline-First**: All data encrypted locally, works without internet
- 🔐 **End-to-End Encryption**: AES-256-GCM encryption using WebCrypto API
- 🔄 **Git Sync**: Optional sync with private GitHub/GitLab repositories
- 📱 **Cross-Platform**: Browser extension and React Native mobile apps
- 🚫 **Privacy-First**: Only private repositories allowed, no telemetry
- 🎯 **Zero-Knowledge**: We never see your passwords or master key

## 📚 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development Guide](#-development-guide)
- [Testing](#-testing)
- [Building for Production](#-building-for-production)
- [Troubleshooting](#-troubleshooting)

## 🏗️ Architecture Overview

Bitterwarden is built as a **monorepo** - a single repository containing multiple related projects that share code and tooling. This approach offers several benefits:

- **Code Sharing**: Core logic (encryption, vault management) is written once and used everywhere
- **Consistent Tooling**: Same build tools, linters, and test runners across all projects
- **Atomic Changes**: Updates that affect multiple packages can be made in a single commit
- **Simplified Dependencies**: Internal packages are linked automatically

### How the Monorepo Works

```
bitterwarden/
├── apps/                    # Applications (the things users interact with)
│   ├── extension/          # Browser extension (Chrome, Firefox, etc.)
│   └── mobile/            # React Native mobile app (iOS & Android)
├── packages/              # Shared code libraries
│   ├── core/             # Business logic (encryption, vault, sync)
│   ├── ui/               # Shared React components
│   └── config/           # Shared configuration files
└── [tooling files]       # Turbo, TypeScript, Biome configs
```

The monorepo is orchestrated by **Turborepo**, which:
- Runs tasks in the correct order based on dependencies
- Caches build outputs for speed
- Runs tasks in parallel when possible

## 🛠️ Technology Stack

### Core Technologies

- **[Bun](https://bun.sh/)**: Fast JavaScript runtime and package manager (replaces Node.js and npm)
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe JavaScript for better developer experience
- **[Turborepo](https://turbo.build/repo)**: Monorepo orchestration tool for efficient builds
- **[React](https://react.dev/)**: UI library for building user interfaces

### Platform-Specific Technologies

#### Browser Extension (`apps/extension/`)
- **[Vite](https://vitejs.dev/)**: Fast build tool for web applications
- **[WebExtension API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)**: Browser extension APIs
- **[webextension-polyfill](https://github.com/mozilla/webextension-polyfill)**: Cross-browser compatibility layer

#### Mobile App (`apps/mobile/`)
- **[React Native](https://reactnative.dev/)**: Framework for building native mobile apps with React
- **[Expo](https://expo.dev/)**: Platform for React Native development and deployment
- **[React Navigation](https://reactnavigation.org/)**: Navigation library for React Native

### Development Tools

- **[Biome](https://biomejs.dev/)**: Fast linter and formatter (replaces ESLint and Prettier)
- **[tsup](https://tsup.egoist.dev/)**: TypeScript bundler for libraries
- **Testing**: Bun's built-in test runner with React Testing Library

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Bun** (latest version)
   ```bash
   # macOS/Linux/WSL
   curl -fsSL https://bun.sh/install | bash
   
   # Or with npm (if you have Node.js)
   npm install -g bun
   ```

2. **Git** for version control
   ```bash
   git --version  # Should be 2.0 or higher
   ```

3. **For Mobile Development** (optional):
   - **iOS**: Xcode (Mac only) - [Download from App Store](https://apps.apple.com/us/app/xcode/id497799835)
   - **Android**: Android Studio - [Download](https://developer.android.com/studio)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/bitterwarden.git
cd bitterwarden
```

### 2. Install Dependencies

```bash
bun install
```

This single command:
- Installs all dependencies for all packages and apps
- Sets up symbolic links between internal packages
- Prepares the development environment

### 3. Build the Shared Packages

```bash
bun run build
```

This builds the shared packages (`@bitterwarden/core` and `@bitterwarden/ui`) that the apps depend on.

### 4. Start Development

#### For Browser Extension:
```bash
bun run dev:extension
```
- Opens Vite dev server at `http://localhost:5173`
- Hot Module Replacement (HMR) for instant updates
- To test in browser: Load `apps/extension/dist` as unpacked extension

#### For Mobile App:
```bash
bun run dev:mobile
```
- Starts Expo development server
- Scan QR code with Expo Go app on your phone
- Or press `i` for iOS simulator, `a` for Android emulator

## 📁 Project Structure

### Understanding the Monorepo Layout

```
bitterwarden/
├── apps/                         # User-facing applications
│   ├── extension/               # Browser Extension
│   │   ├── src/
│   │   │   ├── background/     # Background script (runs continuously)
│   │   │   ├── content/        # Content scripts (injected into web pages)
│   │   │   ├── popup/          # Extension popup UI
│   │   │   └── options/        # Extension settings page
│   │   ├── manifest.json        # Extension configuration
│   │   └── vite.config.ts       # Build configuration
│   │
│   └── mobile/                  # React Native Mobile App
│       ├── src/
│       │   ├── screens/         # App screens (Login, Vault, Settings)
│       │   ├── components/      # Mobile-specific components
│       │   ├── services/        # Platform services (storage, biometrics)
│       │   └── contexts/        # React contexts for state management
│       ├── app.json             # Expo configuration
│       └── App.tsx              # App entry point
│
├── packages/                     # Shared code libraries
│   ├── core/                    # Core business logic
│   │   ├── src/
│   │   │   ├── crypto/          # Encryption/decryption functions
│   │   │   ├── vault/           # Vault management
│   │   │   ├── sync/            # Git synchronization
│   │   │   └── types/           # TypeScript type definitions
│   │   └── package.json
│   │
│   ├── ui/                      # Shared UI components
│   │   ├── src/
│   │   │   └── components/      # Reusable React components
│   │   └── package.json
│   │
│   └── config/                  # Shared configuration
│       ├── tsconfig.base.json   # Base TypeScript config
│       └── package.json
│
├── package.json                  # Root package.json with workspace config
├── turbo.json                    # Turborepo pipeline configuration
├── biome.json                    # Linter/formatter configuration
└── bun.lockb                     # Lock file for dependencies
```

### How Packages Work Together

1. **`@bitterwarden/core`**: Contains all business logic
   - Encryption/decryption algorithms
   - Vault item management
   - Password generation
   - Git synchronization
   - Used by both extension and mobile app

2. **`@bitterwarden/ui`**: Shared React components
   - Button, Input, Toast components
   - Consistent styling across platforms
   - Used by both extension and mobile app

3. **Apps import packages** using workspace aliases:
   ```typescript
   import { VaultService, encrypt } from "@bitterwarden/core";
   import { Button, Input } from "@bitterwarden/ui";
   ```

## 💻 Development Guide

### Understanding Turborepo Commands

Turborepo manages the build pipeline. When you run a command, it:
1. Analyzes dependencies between packages
2. Runs tasks in the correct order
3. Caches results for speed

#### Available Commands

```bash
# Development
bun run dev           # Start all dev servers
bun run dev:extension # Start only extension dev server
bun run dev:mobile    # Start only mobile dev server

# Building
bun run build         # Build all packages and apps
bun run build:extension # Build only the extension
bun run build:mobile  # Build only the mobile app

# Quality Checks
bun run lint          # Run Biome linter on all code
bun run check         # Run Biome checks (lint + format check)
bun run check:fix     # Auto-fix linting and formatting issues
bun run typecheck     # Run TypeScript type checking
bun run test          # Run all tests
bun run test:coverage # Run tests with coverage report

# Utilities
bun run clean         # Remove all build artifacts
bun run format        # Format all code with Biome
```

### Working with the Browser Extension

Browser extensions have a unique architecture:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Background     │────▶│   Popup UI      │────▶│  Content Script │
│   Service       │     │  (React App)    │     │  (Injected)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
                        ┌─────────────────┐
                        │  Storage API    │
                        │  (vault data)   │
                        └─────────────────┘
```

- **Background Service**: Always running, manages vault state
- **Popup UI**: Opens when user clicks extension icon
- **Content Script**: Injected into web pages for autofill
- **Storage API**: Browser's local storage for persisting data

#### Loading the Extension for Testing

1. Build the extension:
   ```bash
   bun run build:extension
   ```

2. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `apps/extension/dist` folder

3. Load in Firefox:
   - Open `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select any file in `apps/extension/dist` folder

### Working with React Native / Expo

React Native allows writing mobile apps using React:

```
┌─────────────────┐
│   JavaScript    │  Your React code
│    (React)      │
└────────┬────────┘
         │
┌────────▼────────┐
│  React Native   │  Bridge to native code
│     Bridge      │
└────────┬────────┘
         │
┌────────▼────────┐
│  Native Code    │  Platform-specific code
│  (iOS/Android)  │
└─────────────────┘
```

Expo provides:
- Development server with hot reload
- Access to native APIs (camera, storage, etc.)
- Build service for creating app binaries
- Over-the-air updates

#### Testing on Devices

1. **Using Expo Go** (Easiest):
   ```bash
   bun run dev:mobile
   ```
   - Install Expo Go on your phone
   - Scan the QR code shown in terminal

2. **iOS Simulator** (Mac only):
   - Press `i` in the Expo terminal
   - Requires Xcode installed

3. **Android Emulator**:
   - Press `a` in the Expo terminal
   - Requires Android Studio installed

### Making Changes

#### Adding a New Feature

1. **Update Core Logic** (if needed):
   ```typescript
   // packages/core/src/vault/index.ts
   export function newFeature() {
     // Implementation
   }
   ```

2. **Add UI Components** (if needed):
   ```typescript
   // packages/ui/src/components/NewComponent.tsx
   export function NewComponent() {
     return <div>New Component</div>;
   }
   ```

3. **Implement in Apps**:
   ```typescript
   // apps/extension/src/popup/App.tsx
   import { newFeature } from "@bitterwarden/core";
   import { NewComponent } from "@bitterwarden/ui";
   ```

4. **Test Your Changes**:
   ```bash
   bun run test        # Run tests
   bun run typecheck   # Check types
   bun run check       # Run linter
   ```

## 🧪 Testing

### Test Structure

```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx    # Test file next to source
├── crypto/
│   ├── index.ts
│   └── crypto.test.ts     # Test file for crypto functions
```

### Writing Tests

```typescript
import { describe, it, expect } from "bun:test";

describe("Feature Name", () => {
  it("should do something", () => {
    const result = myFunction();
    expect(result).toBe(expectedValue);
  });
});
```

### Running Tests

```bash
# Run all tests
bun run test

# Run tests for specific package
cd packages/core && bun test

# Run with coverage
bun run test:coverage

# Watch mode (re-run on changes)
bun test --watch
```

## 📦 Building for Production

### Browser Extension

```bash
bun run build:extension
```

Creates optimized build in `apps/extension/dist/`:
- Minified JavaScript
- Optimized assets
- Ready to upload to Chrome Web Store or Firefox Add-ons

### Mobile App

```bash
# Build for Expo (creates APK/IPA)
cd apps/mobile
npx eas build --platform android  # Android APK
npx eas build --platform ios      # iOS IPA

# Or build locally
npx expo prebuild  # Generate native projects
npx expo run:android
npx expo run:ios
```

## 🐛 Troubleshooting

### Common Issues

#### "Cannot find module '@bitterwarden/core'"
- Run `bun install` to set up workspace links
- Run `bun run build` to build packages

#### "Type error in TypeScript"
- Run `bun run typecheck` to see all type errors
- Ensure packages are built: `bun run build`

#### Extension not updating
- Reload the extension in browser
- Check console for errors: Right-click popup → Inspect

#### Mobile app not connecting
- Ensure phone and computer are on same network
- Try using tunnel: `npx expo start --tunnel`

#### Build cache issues
```bash
bun run clean      # Clear all build artifacts
rm -rf node_modules # Remove dependencies
bun install        # Reinstall
bun run build      # Rebuild
```

### Getting Help

1. Check error messages carefully
2. Look at existing code for examples
3. Run `bun run check` to catch common issues
4. Use TypeScript's type hints in your editor

## 🔒 Security

- All passwords are encrypted using Web Crypto API (AES-256-GCM)
- PBKDF2 with 100,000 iterations for key derivation
- Vault data never leaves the device unencrypted
- Optional Git sync uses encrypted repositories only
- Private repository enforcement for Git sync
- No telemetry or analytics
- Zero-knowledge architecture

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass (`bun run test`)
5. Ensure no lint errors (`bun run check`)
6. Ensure types are correct (`bun run typecheck`)
7. Submit a pull request

## 🚨 Security Disclosure

If you discover a security vulnerability, please email security@bitterwarden.app

---

Built with ❤️ using modern web technologies