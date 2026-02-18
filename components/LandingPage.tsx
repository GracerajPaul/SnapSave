
import React, { useState, useEffect } from 'react';
import { PlusCircle, Key, Lock, Image as ImageIcon, ShieldCheck, Terminal, Fingerprint, ShieldAlert, ChevronRight, Zap } from 'lucide-react';
import { TermsModal } from './TermsModal.tsx';
import { APP_NAME, TAGLINE } from '../constants.tsx';

interface LandingPageProps {
  onCreateClick: () => void;
  onAccessClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onCreateClick, onAccessClick }) => {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-1000 relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-80 h-80 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mb-20 space-y-8 relative z-10">
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-500/5 border border-indigo-500/20 rounded-full mb-4 animate-bounce">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Protocol v2.0 Obsidian</span>
        </div>
        
        <h2 className="text-6xl sm:text-8xl font-black text-white mb-6 italic tracking-tighter leading-none uppercase">
          Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-white to-cyan-400 text-glow">Sovereignty</span> <br/>
          Built in Silence
        </h2>
        
        <p className="text-slate-500 text-xl sm:text-2xl leading-relaxed max-w-3xl mx-auto italic font-medium">
          Registration-free encryption for your most sensitive visual assets. No logs. No identity. Just pure <span className="text-white">cryptographic isolation</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl relative z-10">
        <button 
          onClick={onCreateClick}
          className="group relative overflow-hidden p-12 rounded-[3.5rem] transition-all duration-500 transform text-left glass-card border-white/5 hover:border-indigo-500/40 hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(99,102,241,0.3)] bg-slate-900/40"
        >
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px] group-hover:bg-indigo-500/20 transition-colors" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform shadow-xl shadow-indigo-600/40">
                <PlusCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-4xl font-black mb-4 text-white italic uppercase tracking-tighter">Forge New Nexus</h3>
            <p className="text-slate-500 text-lg font-medium italic mb-6">Initialize a private vault node. Deploy custom credentials and secure your first asset stream.</p>
            <div className="flex items-center gap-2 text-indigo-400 font-black uppercase text-xs tracking-widest group-hover:gap-4 transition-all">
                Initialize Secure Node <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </button>

        <button 
          onClick={onAccessClick}
          className="group relative overflow-hidden p-12 rounded-[3.5rem] transition-all duration-500 transform text-left glass-card border-white/5 hover:border-emerald-500/40 hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(16,185,129,0.2)] bg-slate-900/40"
        >
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px] group-hover:bg-emerald-500/20 transition-colors" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-slate-800 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:-rotate-12 transition-transform shadow-xl">
                <Key className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-4xl font-black mb-4 text-white italic uppercase tracking-tighter">Access Terminal</h3>
            <p className="text-slate-500 text-lg font-medium italic mb-6">Re-establish connection with an existing vault node. Verify PIN credentials to unlock your snaps.</p>
            <div className="flex items-center gap-2 text-emerald-400 font-black uppercase text-xs tracking-widest group-hover:gap-4 transition-all">
                Authenticate Session <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </button>
      </div>

      <div className="mt-32 grid grid-cols-1 sm:grid-cols-3 gap-12 w-full max-w-6xl relative z-10">
        <Feature 
          icon={<Fingerprint className="w-7 h-7 text-indigo-400" />} 
          title="Ghost Identity" 
          description="We never ask for emails or names. Your username is your only footprint."
        />
        <Feature 
          icon={<ShieldAlert className="w-7 h-7 text-cyan-400" />} 
          title="Panic Response" 
          description="Instant emergency lock protocols to wipe sessions during security threats."
        />
        <Feature 
          icon={<ShieldCheck className="w-7 h-7 text-emerald-400" />} 
          title="Quantum Proof" 
          description="Images are shards across Telegram's global encrypted infrastructure."
        />
      </div>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};

const Feature: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="flex flex-col items-center text-center p-10 rounded-[2.5rem] glass-card border-white/5 bg-slate-950/40 hover:bg-slate-900/60 transition-all group">
    <div className="mb-6 p-5 bg-slate-900 rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl">{icon}</div>
    <h4 className="text-xl font-black text-white mb-3 uppercase italic tracking-tight">{title}</h4>
    <p className="text-sm text-slate-500 leading-relaxed font-medium italic">{description}</p>
  </div>
);
