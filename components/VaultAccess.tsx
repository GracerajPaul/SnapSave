
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Key, Unlock } from 'lucide-react';
import { Vault } from '../types.ts';
import { StorageService } from '../services/storageService.ts';
import { AuthService } from '../services/authService.ts';
import { TermsModal } from './TermsModal.tsx';

interface VaultAccessProps {
  onSuccess: (vault: Vault) => void;
  onCancel: () => void;
}

export const VaultAccess: React.FC<VaultAccessProps> = ({ onSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTerms, setShowTerms] = useState(false);

  // Extract Vault ID from hash if available
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const vaultId = urlParams.get('vaultId');
    if (vaultId) {
      StorageService.getVaultById(vaultId).then(v => {
        if (v) setUsername(v.username);
      });
    }
  }, []);

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username) return setError('Username is required');
    if (!pin) return setError('PIN is required');

    setLoading(true);
    try {
      const vault = await StorageService.getVaultByUsername(username);
      if (!vault) throw new Error('Vault not found');
      
      if (vault.isEmergencyLocked) {
        throw new Error('This vault has been emergency locked');
      }

      const isValid = await AuthService.verifyPin(pin, vault.pinHash);
      if (!isValid) {
        await StorageService.incrementFailedAttempts(vault.id);
        throw new Error('Invalid PIN');
      }

      // Success
      await StorageService.resetFailedAttempts(vault.id);
      onSuccess(vault);
    } catch (err: any) {
      setError(err.message || 'Access failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto animate-in slide-in-from-bottom-8 duration-500">
      <button 
        onClick={onCancel}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to home
      </button>

      <div className="glass-card p-8 rounded-3xl shadow-2xl">
        <div className="mb-8 text-center">
          <div className="inline-flex p-3 bg-indigo-500/10 rounded-2xl mb-4">
            <Key className="w-8 h-8 text-indigo-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Unlock Vault</h2>
          <p className="text-slate-400 text-sm mt-1">Enter credentials to proceed</p>
        </div>

        <form onSubmit={handleAccess} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
            <input 
              type="text"
              required
              placeholder="Your username"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Vault PIN</label>
            <input 
              type="password"
              required
              maxLength={6}
              placeholder="••••••"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white tracking-widest text-center text-lg font-mono"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
              !loading
              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <Unlock className="w-5 h-5" />
                Access Vault
              </>
            )}
          </button>
        </form>
      </div>
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};
