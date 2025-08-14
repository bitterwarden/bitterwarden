import React, { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';
import { Button } from '@bitterwarden/ui';
import type { VaultItem } from '@bitterwarden/core';

export function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [password, setPassword] = useState('');

  useEffect(() => {
    checkVaultStatus();
  }, []);

  async function checkVaultStatus() {
    const storage = await browser.storage.local.get('vault');
    setIsLocked(!!storage.vault);
  }

  async function unlock() {
    const storage = await browser.storage.local.get('vault');
    const response = await browser.runtime.sendMessage({
      type: 'UNLOCK_VAULT',
      password,
      encryptedVault: storage.vault,
    });

    if (response.success) {
      setIsLocked(false);
      loadItems();
    } else {
      alert('Failed to unlock: ' + response.error);
    }
  }

  async function lock() {
    await browser.runtime.sendMessage({ type: 'LOCK_VAULT' });
    setIsLocked(true);
    setItems([]);
    setPassword('');
  }

  async function loadItems() {
    const items = await browser.runtime.sendMessage({ type: 'GET_ITEMS' });
    setItems(items || []);
  }

  if (isLocked) {
    return (
      <div className="w-80 p-4">
        <h1 className="text-xl font-bold mb-4">Bitterwarden</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Master password"
          className="w-full p-2 border rounded mb-4"
          onKeyDown={(e) => e.key === 'Enter' && unlock()}
        />
        <Button onClick={unlock} className="w-full">
          Unlock
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Bitterwarden</h1>
        <Button onClick={lock} variant="outline" size="sm">
          Lock
        </Button>
      </div>
      
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-gray-500">No items in vault</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-2 border rounded hover:bg-gray-50 cursor-pointer"
            >
              <div className="font-medium">{item.name}</div>
              {item.username && (
                <div className="text-sm text-gray-600">{item.username}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}