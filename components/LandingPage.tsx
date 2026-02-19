
import React, { useState } from 'react';
import { PlusCircle, Key, ShieldCheck, Zap, Globe, HardDrive, Cpu, Activity, ChevronRight, Layers, Fingerprint, Command, Shield } from 'lucide-react';
import { TermsModal } from './TermsModal.tsx';
import { APP_NAME, TAGLINE } from '../constants.tsx';

interface LandingPageProps {
  onCreateClick: () => void;
  onAccessClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onCreateClick, onAccessClick }) => {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-1000 relative">
      
      {/* High-Concept Hero */}
      <div className="max-w-6xl mb-32 space-y-12 relative z-10 px-4">
        <div className="inline-flex items-center gap-4 px-6 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full mb-6 animate-in slide-in-from-top-4 duration-1000">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
              <span className="text-[10px] font-black text-white uppercase tracking-[0.5em]">System Node v4.1 Established</span>
            </div>
        </div>
        
        <h2 className="text-7xl md:text-[11rem] font-[950] text-white leading-[0.8] tracking-tighter uppercase italic">
          Absolute <br/> <span className="text-transparent bg-clip-text bg-gradient-to-b from-indigo-300 via-indigo-600 to-indigo-900 text-glow">Discretion</span>
        </h2>
        
        <p className="text-slate-400 text-xl md:text-3xl leading-relaxed max-w-4xl mx-auto italic font-medium pt-4">
          The ultimate protocol for registration-free asset sovereignty. <br className="hidden md:block"/>
          <span className="text-white">Invisible sharding</span> across a distributed global architecture.
        </p>

        <div className="pt-12 flex flex-wrap justify-center gap-8">
           <button 
            onClick={onCreateClick}
            className="px-14 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-[900] italic uppercase tracking-[0.2em] shadow-[0_20px_60px_-15px_rgba(79,70,229,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center gap-4"
           >
             Deploy Node <PlusCircle className="w-6 h-6" />
           </button>
           <button 
            onClick={onAccessClick}
            className="px-14 py-6 bg-slate-800/40 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-3xl font-[900] italic uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 flex items-center gap-4 backdrop-blur-xl"
           >
             Uplink Link <Key className="w-6 h-6 text-indigo-400" />
           </button>
        </div>
      </div>

      {/* Grid Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 w-full max-w-7xl relative z-10 px-8">
        <ActionCard 
          onClick={onCreateClick}
          title="Forge"
          sub="New Node Deployment"
          desc="Initialize a ghost-vault with zero metadata footprints. Immediate asset sharding upon injection."
          icon={<Shield className="w-10 h-10" />}
          color="indigo"
        />
        <ActionCard 
          onClick={onAccessClick}
          title="Uplink"
          sub="Terminal Authorization"
          desc="Establish a secure encrypted handshake with your existing node using 6-digit PIN verification."
          icon={<Activity className="w-10 h-10" />}
          color="slate"
        />
      </div>

      {/* Editorial Feature Matrix */}
      <div className="mt-56 grid grid-cols-1 md:grid-cols-3 gap-20 w-full max-w-7xl px-8 border-t border-white/5 pt-24">
        <FeatureItem 
          icon={<Fingerprint />}
          title="Zero Footprint"
          desc="Our architecture is designed for silence. No logs, no emails, no traces of your digital existence."
        />
        <FeatureItem 
          icon={<Layers />}
          title="Shard Redundancy"
          desc="Assets are atomized into encrypted shards and distributed across a resilient cloud lattice."
        />
        <FeatureItem 
          icon={<Zap />}
          title="Insta-Export"
          desc="A single command compiles your entire distributed vault into a secure, locally-stored ZIP archive."
        />
      </div>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};

const ActionCard = ({ onClick, title, sub, desc, icon, color }: any) => {
  const isIndigo = color === 'indigo';

  return (
    <button 
      onClick={onClick}
      className={`group relative overflow-hidden p-16 rounded-[4rem] transition-all duration-700 text-left glass-card flex flex-col items-start min-h-[500px] border-white/5 ${isIndigo ? 'hover:border-indigo-500/50 shadow-[0_0_100px_-40px_rgba(79,70,229,0.1)]' : 'hover:border-white/20'}`}
    >
      <div className="absolute inset-0 cyber-shimmer opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      
      <div className="mb-12 p-6 bg-slate-900/50 rounded-[2rem] border border-white/5 group-hover:scale-110 group-hover:bg-indigo-600 transition-all shadow-2xl group-hover:text-white text-indigo-500">
        {icon}
      </div>

      <div className="mt-auto">
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-4 block">{sub}</span>
        <h3 className="text-6xl font-[1000] text-white italic uppercase tracking-tighter mb-6 leading-none">{title}</h3>
        <p className="text-slate-400 text-xl font-medium italic leading-relaxed mb-10 max-w-sm">{desc}</p>
        
        <div className={`flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] ${isIndigo ? 'text-indigo-400' : 'text-slate-200'} group-hover:gap-8 transition-all`}>
          Execute Protocol <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </button>
  );
};

const FeatureItem = ({ icon, title, desc }: any) => (
  <div className="flex flex-col items-start text-left group">
    <div className="w-16 h-16 rounded-2xl bg-slate-900/40 border border-white/5 flex items-center justify-center text-indigo-500 mb-8 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl">
      {React.cloneElement(icon as React.ReactElement, { className: "w-8 h-8" })}
    </div>
    <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">{title}</h4>
    <p className="text-slate-500 text-lg italic leading-relaxed font-medium">{desc}</p>
  </div>
);
