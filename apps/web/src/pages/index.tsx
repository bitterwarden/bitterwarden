import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@bitterwarden/ui';
import { useState, useEffect } from 'react';
import { VaultService } from '@bitterwarden/core';

export default function Home() {
  const { data: session, status } = useSession();
  const [vault] = useState(() => new VaultService());
  const [isUnlocked, setIsUnlocked] = useState(false);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Bitterwarden</h1>
            <p className="text-gray-400">Offline-first password manager with Git sync</p>
          </div>
          
          <div className="mt-8 space-y-4">
            <Button
              onClick={() => signIn('github')}
              className="w-full"
            >
              Sign in with GitHub
            </Button>
            
            <p className="text-center text-sm text-gray-500">
              Only private repositories will be allowed for vault storage
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">Bitterwarden Vault</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                {session.user?.email}
              </span>
              <Button
                onClick={() => signOut()}
                variant="outline"
                size="sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isUnlocked ? (
          <div className="max-w-md mx-auto">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-medium text-white mb-4">
                Unlock Your Vault
              </h2>
              <input
                type="password"
                placeholder="Master Password"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={() => setIsUnlocked(true)}
                className="w-full mt-4"
              >
                Unlock
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-medium text-white mb-4">
                Your Vault Items
              </h2>
              <p className="text-gray-400">
                Your vault is unlocked. Items will appear here.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}