
import React, { useState } from 'react';
import { ArrowLeft, Loader2, Clock, CheckSquare, Square, ShieldCheck } from 'lucide-react';
import { ExpiryOption, Vault } from '../types.ts';
import { StorageService } from '../services/storageService.ts';
import { AuthService } from '../services/authService.ts';
import { TermsModal } from './TermsModal.tsx';

interface VaultCreationProps {
  onSuccess: (vault: Vault) => void;
  onCancel: () => void;
}

export const VaultCreation: React.FC<VaultCreationProps> = ({ onSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [vaultName, setVaultName] = useState('');
  const [expiry, setExpiry] = useState<ExpiryOption>(ExpiryOption.ONE_DAY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!termsAccepted) return setError('You must accept protocol constraints');
    if (username.length < 3) return setError('ID too short (min 3 chars)');
    if (pin.length < 4 || pin.length > 6) return setError('PIN must be 4-6 digits');
    if (!/^\d+$/.test(pin)) return setError('PIN must be numeric only');

    setLoading(true);
    try {
      const pinHash = await AuthService.hashPin(pin);
      const newVault = await StorageService.createVault({
        username,
        vaultName,
        pinHash,
        expiry
      });
      onSuccess(newVault);
    } catch (err: any) {
      setError(err.message || 'Creation sequence failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto animate-in slide-in-from-bottom-8 duration-1000 relative px-2">
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/10 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-600/10 blur-[100px] pointer-events-none animate-pulse" />

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
            <ShieldCheck className="w-10 h-10 animate-pulse" />
          </div>
          <h2 className="text-4xl font-[1000] text-white italic uppercase tracking-tighter leading-none mb-3">Forge Node</h2>
          <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.4em]">Initialize Shard Lattice</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-8 transform-gpu group-hover:translate-z-10">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] ml-4">Access Key</label>
              <input 
                type="password"
                required
                maxLength={6}
                placeholder="••••••"
                autoComplete="new-password"
                className="w-full bg-slate-950/80 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-white tracking-[0.5em] text-center text-xl font-mono placeholder:text-slate-800 transition-all"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] ml-4">Nexus Label</label>
              <input 
                type="text"
                placeholder="PRIVATE_VAULT"
                className="w-full bg-slate-950/80 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-white font-bold tracking-tight uppercase placeholder:text-slate-800 transition-all"
                value={vaultName}
                onChange={(e) => setVaultName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] ml-4 flex items-center gap-2">
              <Clock className="w-3 h-3" /> Expiry Protocol
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: '24h', value: ExpiryOption.ONE_DAY },
                { label: '7d', value: ExpiryOption.SEVEN_DAYS },
                { label: '30d', value: ExpiryOption.THIRTY_DAYS },
                { label: 'Never', value: ExpiryOption.NEVER },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setExpiry(opt.value)}
                  className={`py-3 px-1 text-[10px] rounded-xl border transition-all font-black uppercase tracking-tighter ${
                    expiry === opt.value 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                    : 'bg-slate-950/50 border-white/5 text-slate-600 hover:text-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div 
            className="flex items-start gap-4 cursor-pointer group p-5 bg-slate-950/50 rounded-2xl border border-white/5 hover:border-white/10 transition-all"
            onClick={() => setTermsAccepted(!termsAccepted)}
          >
            <div className="mt-0.5">
              {termsAccepted ? (
                <CheckSquare className="w-6 h-6 text-indigo-500" />
              ) : (
                <Square className="w-6 h-6 text-slate-800 group-hover:text-slate-600" />
              )}
            </div>
            <p className="text-[9px] text-slate-500 leading-tight select-none uppercase font-black tracking-tight">
              I accept the protocol constraints including the 50MB file limit and waiver.
              <button 
                type="button"
                className="text-indigo-400 hover:underline font-black ml-1"
                onClick={(e) => { e.stopPropagation(); setShowTerms(true); }}
              >
                TERMS
              </button>
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center animate-in shake duration-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !termsAccepted}
            className={`w-full py-6 rounded-[2rem] font-[1000] italic uppercase tracking-[0.3em] text-white transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 ${
              termsAccepted && !loading
              ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20' 
              : 'bg-slate-900 text-slate-700 cursor-not-allowed border border-white/5'
            }`}
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Execute Deployment'}
          </button>
        </form>
      </div>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};
