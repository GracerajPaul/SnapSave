
import React, { useState } from 'react';
import { ArrowLeft, Loader2, Sparkles, Clock, CheckSquare, Square } from 'lucide-react';
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

    if (!termsAccepted) return setError('You must accept the terms to continue');
    if (username.length < 3) return setError('Username too short (min 3 chars)');
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
      setError(err.message || 'Failed to create vault');
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
            <Sparkles className="w-8 h-8 text-indigo-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create Your Vault</h2>
          <p className="text-slate-400 text-sm mt-1">Set up your secure space in seconds</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Unique Username</label>
            <input 
              type="text"
              required
              placeholder="e.g. shadow_ninja"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Security PIN</label>
              <input 
                type="password"
                required
                maxLength={6}
                placeholder="4-6 digits"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white tracking-widest text-center text-lg"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Vault Name (Optional)</label>
              <input 
                type="text"
                placeholder="Private Pics"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
                value={vaultName}
                onChange={(e) => setVaultName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Auto-Delete After
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
                  className={`py-2 px-1 text-xs rounded-lg border transition-all ${
                    expiry === opt.value 
                    ? 'bg-indigo-600 border-indigo-500 text-white font-semibold' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div 
            className="flex items-start gap-3 cursor-pointer group p-3 bg-slate-800/30 rounded-xl border border-slate-700/50"
            onClick={() => setTermsAccepted(!termsAccepted)}
          >
            <div className="mt-0.5">
              {termsAccepted ? (
                <CheckSquare className="w-5 h-5 text-indigo-500" />
              ) : (
                <Square className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
              )}
            </div>
            <p className="text-xs text-slate-400 leading-tight select-none">
              I agree to the{' '}
              <button 
                type="button"
                className="text-indigo-400 hover:underline font-semibold"
                onClick={(e) => { e.stopPropagation(); setShowTerms(true); }}
              >
                Terms and Conditions
              </button>
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !termsAccepted}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
              termsAccepted && !loading
              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Initialize Vault'}
          </button>
        </form>
      </div>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};
