
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
    <div className="max-w-md mx-auto animate-in slide-in-from-bottom-8 duration-500 px-2">
      <button 
        onClick={onCancel}
        className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 md:mb-8 transition-colors text-xs font-black uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Terminal
      </button>

      <div className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl border-white/5">
        <div className="mb-6 md:mb-10 text-center">
          <div className="inline-flex p-4 bg-indigo-500/10 rounded-2xl mb-4 md:mb-6 border border-indigo-500/20">
            <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-indigo-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-[1000] text-white uppercase italic tracking-tighter leading-none mb-2">Forge Node</h2>
          <p className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Unlimited shard capacity.</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-5 md:space-y-6">
          <div>
            <label className="block text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 px-1">Node Identifier</label>
            <input 
              type="text"
              required
              placeholder="e.g. ghost_operative"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl md:rounded-2xl px-5 py-3 md:py-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-white font-medium"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 px-1">Access PIN</label>
              <input 
                type="password"
                required
                maxLength={6}
                placeholder="4-6 Digits"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl md:rounded-2xl px-5 py-3 md:py-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-white tracking-[0.5em] text-center text-lg md:text-xl font-mono"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div>
              <label className="block text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 px-1">Nexus Label</label>
              <input 
                type="text"
                placeholder="Private_Vault"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl md:rounded-2xl px-5 py-3 md:py-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-white font-medium"
                value={vaultName}
                onChange={(e) => setVaultName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-2 px-1">
              <Clock className="w-3 h-3" /> Expiry Protocol
            </label>
            <div className="grid grid-cols-4 gap-2">
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
                  className={`py-2.5 px-1 text-[10px] md:text-xs rounded-xl border transition-all font-black uppercase tracking-tighter ${
                    expiry === opt.value 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                    : 'bg-slate-950/50 border-slate-800 text-slate-600 hover:text-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div 
            className="flex items-start gap-3 cursor-pointer group p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all"
            onClick={() => setTermsAccepted(!termsAccepted)}
          >
            <div className="mt-0.5">
              {termsAccepted ? (
                <CheckSquare className="w-5 h-5 text-indigo-500" />
              ) : (
                <Square className="w-5 h-5 text-slate-800 group-hover:text-slate-600" />
              )}
            </div>
            <p className="text-[9px] md:text-[10px] text-slate-500 leading-tight select-none uppercase font-black tracking-tight">
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
            <div className="p-3 bg-red-600/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black text-center uppercase tracking-widest">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !termsAccepted}
            className={`w-full py-4 md:py-5 rounded-2xl font-[1000] text-white italic uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
              termsAccepted && !loading
              ? 'bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 active:scale-95' 
              : 'bg-slate-900 text-slate-700 cursor-not-allowed'
            }`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Execute Deployment'}
          </button>
        </form>
      </div>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};
