import browser from 'webextension-polyfill';
import { VaultService, GitSyncService } from '@bitterwarden/core';

const vaultService = new VaultService();
const syncService = new GitSyncService();

browser.runtime.onInstalled.addListener(() => {
  console.log('Bitterwarden extension installed');
});

browser.runtime.onMessage.addListener(async (request, sender) => {
  switch (request.type) {
    case 'UNLOCK_VAULT':
      try {
        await vaultService.unlock(request.password, request.encryptedVault);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }

    case 'LOCK_VAULT':
      const encrypted = await vaultService.lock();
      if (encrypted) {
        await browser.storage.local.set({ vault: encrypted });
      }
      return { success: true };

    case 'GET_ITEMS':
      return vaultService.getAllItems();

    case 'AUTOFILL':
      const tab = sender.tab;
      if (!tab || !tab.url) return null;
      
      const url = new URL(tab.url);
      const items = vaultService.searchItems(url.hostname);
      return items;

    case 'SYNC':
      if (!syncService.isConfigured()) {
        return { success: false, error: 'Sync not configured' };
      }
      
      return { success: true, status: syncService.getStatus() };

    default:
      return null;
  }
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    browser.tabs.sendMessage(tabId, {
      type: 'PAGE_LOADED',
      url: tab.url,
    }).catch(() => {});
  }
});