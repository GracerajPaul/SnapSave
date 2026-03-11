
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Key, Unlock } from 'lucide-react';
import { Vault, isVaultExpired } from '../types.ts';
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
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
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

      if (isVaultExpired(vault)) {
        throw new Error('This vault has expired and is no longer accessible');
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
    <div className="max-w-md mx-auto animate-in slide-in-from-bottom-8 duration-1000 relative">
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/10 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-600/10 blur-[100px] pointer-events-none animate-pulse" />

      <button 
        onClick={onCancel}
        className="flex items-center gap-2 text-slate-500 hover:text-white mb-12 transition-all group px-4 py-2 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Abort Protocol</span>
      </button>

      <div className="glass-card p-10 md:p-16 rounded-[3rem] md:rounded-[4rem] shadow-2xl tilt-3d border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl pointer-events-none" />
        
        <div className="mb-12 text-center transform-gpu group-hover:translate-z-20">
          <div className="inline-flex p-5 bg-slate-950 border border-white/5 rounded-[2rem] mb-6 shadow-inner text-indigo-500">
            <Key className="w-10 h-10 animate-pulse" />
          </div>
          <h2 className="text-4xl font-[1000] text-white italic uppercase tracking-tighter leading-none mb-3">Uplink</h2>
          <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.4em]">Establish Handshake</p>
        </div>

        <form onSubmit={handleAccess} className="space-y-8 transform-gpu group-hover:translate-z-10">
          <div className="space-y-3">
            <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] ml-4">Node Identifier</label>
            <input 
              type="text"
              required
              placeholder="AGENT_ID"
              autoComplete="username"
              className="w-full bg-slate-950/80 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-white font-mono tracking-widest uppercase placeholder:text-slate-800 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] ml-4">Access Key</label>
            <input 
              type="password"
              required
              maxLength={6}
              placeholder="••••••"
              autoComplete="current-password"
              className="w-full bg-slate-950/80 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-white tracking-[1em] text-center text-2xl font-mono placeholder:text-slate-800 transition-all"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center animate-in shake duration-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-6 rounded-[2rem] font-[1000] italic uppercase tracking-[0.3em] text-white transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 ${
              !loading
              ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20' 
              : 'bg-slate-900 text-slate-700 cursor-not-allowed border border-white/5'
            }`}
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <Unlock className="w-6 h-6" />
                Authorize
              </>
            )}
          </button>
        </form>
      </div>
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};
