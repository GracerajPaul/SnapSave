
import React, { useState } from 'react';
import { PlusCircle, Key, ShieldCheck, Zap, Globe, HardDrive, Cpu, Activity, ChevronRight, Layers, Fingerprint, Command } from 'lucide-react';
import { TermsModal } from './TermsModal.tsx';
import { APP_NAME, TAGLINE } from '../constants.tsx';

interface LandingPageProps {
  onCreateClick: () => void;
  onAccessClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onCreateClick, onAccessClick }) => {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-1000 relative">
      
      {/* Hero Section */}
      <div className="max-w-5xl mb-24 space-y-10 relative z-10">
        <div className="inline-flex items-center gap-4 px-5 py-1.5 bg-indigo-500/5 border border-indigo-500/10 rounded-full mb-4 animate-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.4em]">Encrypted Node Architecture v4.0</span>
            </div>
        </div>
        
        <h2 className="text-7xl sm:text-[10rem] font-[900] text-white leading-[0.85] tracking-tighter uppercase italic">
          Total <span className="text-transparent bg-clip-text bg-gradient-to-b from-indigo-400 to-indigo-700 text-glow">Sovereignty</span>
        </h2>
        
        <p className="text-slate-400 text-xl sm:text-2xl leading-relaxed max-w-3xl mx-auto italic font-medium px-6">
          The elite standard for registration-free asset encryption. <br className="hidden sm:block"/>
          <span className="text-white/80">Infinite cloud capacity</span> sharded across global distributed nodes.
        </p>

        <div className="pt-8 flex flex-wrap justify-center gap-6">
           <button 
            onClick={onCreateClick}
            className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black italic uppercase tracking-widest shadow-2xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
           >
             Initialize Nexus <PlusCircle className="w-5 h-5" />
           </button>
           <button 
            onClick={onAccessClick}
            className="px-10 py-5 bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-2xl font-black italic uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
           >
             Access Terminal <Key className="w-5 h-5 text-indigo-400" />
           </button>
        </div>
      </div>

      {/* Primary Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-6xl relative z-10 px-6">
        <ActionCard 
          onClick={onCreateClick}
          title="Forge Node"
          desc="Deploy a private vault node with custom credentials. ZERO metadata logs."
          icon={<PlusCircle className="w-8 h-8" />}
          color="indigo"
        />
        <ActionCard 
          onClick={onAccessClick}
          title="Authenticate"
          desc="Establish a secure uplink to your existing vault using PIN verification."
          icon={<Key className="w-8 h-8" />}
          color="cyan"
        />
      </div>

      {/* Feature Matrix */}
      <div className="mt-40 grid grid-cols-1 sm:grid-cols-3 gap-12 w-full max-w-6xl px-6">
        <FeatureItem 
          icon={<Fingerprint className="w-6 h-6" />}
          title="Ghost Protocol"
          desc="Client-side encryption means we never see your data or your PIN."
        />
        <FeatureItem 
          icon={<Layers className="w-6 h-6" />}
          title="Shard Storage"
          desc="Files are broken into encrypted shards distributed across redundant cloud nodes."
        />
        <FeatureItem 
          icon={<Command className="w-6 h-6" />}
          title="Command Export"
          desc="Download your entire vault as a single compiled ZIP at any time."
        />
      </div>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};

const ActionCard = ({ onClick, title, desc, icon, color }: any) => {
  const colorMap: any = {
    indigo: "from-indigo-600 to-indigo-900 border-indigo-500/20 hover:border-indigo-400/40 shadow-indigo-900/10",
    cyan: "from-slate-800 to-slate-950 border-white/5 hover:border-cyan-500/30 shadow-black/20"
  };

  return (
    <button 
      onClick={onClick}
      className={`group relative overflow-hidden p-14 rounded-[3.5rem] transition-all duration-700 text-left glass-card ${colorMap[color]} hover:-translate-y-3 flex flex-col items-start`}
    >
      <div className="absolute inset-0 cyber-shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="mb-10 p-5 bg-white/5 rounded-3xl border border-white/10 group-hover:scale-110 transition-transform shadow-inner">
        {icon}
      </div>
      <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">{title}</h3>
      <p className="text-slate-400 text-lg font-medium italic leading-relaxed mb-8">{desc}</p>
      <div className={`mt-auto flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] ${color === 'indigo' ? 'text-indigo-400' : 'text-cyan-400'} group-hover:gap-6 transition-all`}>
        Execute Handshake <ChevronRight className="w-4 h-4" />
      </div>
    </button>
  );
};

const FeatureItem = ({ icon, title, desc }: any) => (
  <div className="p-10 flex flex-col items-center text-center group">
    <div className="w-20 h-20 rounded-[2rem] bg-slate-900/50 border border-slate-800 flex items-center justify-center text-indigo-500 mb-8 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl">
      {icon}
    </div>
    <h4 className="text-xl font-black text-white italic uppercase tracking-tight mb-3">{title}</h4>
    <p className="text-slate-500 text-sm italic leading-relaxed font-medium">{desc}</p>
  </div>
);
