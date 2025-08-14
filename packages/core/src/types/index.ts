import { z } from 'zod';

export const VaultItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().optional(),
  password: z.string(),
  url: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastUsed: z.string().datetime().optional(),
});

export type VaultItem = z.infer<typeof VaultItemSchema>;

export const VaultSchema = z.object({
  version: z.number(),
  items: z.array(VaultItemSchema),
  settings: z.object({
    syncEnabled: z.boolean().default(false),
    autoSync: z.boolean().default(false),
    syncInterval: z.number().default(300000), // 5 minutes
    gitRemote: z.string().optional(),
    gitBranch: z.string().default('main'),
  }),
});

export type Vault = z.infer<typeof VaultSchema>;

export interface EncryptedVault {
  salt: string;
  iv: string;
  data: string;
  version: number;
}

export interface GitConfig {
  remote: string;
  branch: string;
  isPrivate: boolean;
  provider: 'github' | 'gitlab' | 'custom';
  authToken?: string;
  username?: string;
  email?: string;
}

export interface SyncStatus {
  lastSync: Date | null;
  isSyncing: boolean;
  error: string | null;
  pendingChanges: number;
}