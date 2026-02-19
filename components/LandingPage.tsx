
import React, { useState } from 'react';
import { PlusCircle, Key, ChevronRight, Layers, Fingerprint, Zap, Shield, Activity } from 'lucide-react';
import { TermsModal } from './TermsModal.tsx';

interface LandingPageProps {
  onCreateClick: () => void;
  onAccessClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onCreateClick, onAccessClick }) => {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-10 md:py-24 text-center animate-in fade-in duration-1000 relative overflow-hidden">
      
      {/* High-Concept Hero Section */}
      <div className="max-w-6xl mb-16 md:mb-32 space-y-8 md:space-y-12 relative z-10 px-4">
        <div className="inline-flex items-center gap-3 px-4 md:px-6 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full mb-4 md:mb-6 animate-in slide-in-from-top-4 duration-1000">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
              <span className="text-[8px] md:text-[10px] font-black text-white uppercase tracking-[0.3em] md:tracking-[0.5em]">System Node v4.1 Established</span>
            </div>
        </div>
        
        <h2 className="text-4xl sm:text-7xl md:text-9xl lg:text-[11rem] font-[950] text-white leading-[0.85] md:leading-[0.8] tracking-tighter uppercase italic">
          Absolute <br className="hidden xs:block"/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-indigo-300 via-indigo-600 to-indigo-900 text-glow">Discretion</span>
        </h2>
        
        <p className="text-slate-500 text-base md:text-2xl lg:text-3xl leading-relaxed max-w-4xl mx-auto italic font-medium pt-4 px-2">
          The ultimate protocol for registration-free asset sovereignty. 
          <span className="text-white block mt-2">Distributed sharding across a resilient global lattice.</span>
        </p>

        <div className="pt-8 md:pt-12 flex flex-col sm:flex-row justify-center gap-4 md:gap-8 px-6">
           <button 
            onClick={onCreateClick}
            className="w-full sm:w-auto px-8 md:px-14 py-4 md:py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl md:rounded-3xl font-[900] italic uppercase tracking-[0.15em] md:tracking-[0.2em] shadow-xl md:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-4"
           >
             Deploy Node <PlusCircle className="w-5 h-5 md:w-6 md:h-6" />
           </button>
           <button 
            onClick={onAccessClick}
            className="w-full sm:w-auto px-8 md:px-14 py-4 md:py-6 bg-slate-800/40 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-2xl md:rounded-3xl font-[900] italic uppercase tracking-[0.15em] md:tracking-[0.2em] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-4 backdrop-blur-xl"
           >
             Uplink <Key className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
           </button>
        </div>
      </div>

      {/* Grid Architecture - Responsive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 w-full max-w-7xl relative z-10 px-6 md:px-8">
        <ActionCard 
          onClick={onCreateClick}
          title="Forge"
          sub="Deployment Protocol"
          desc="Initialize a ghost-vault with zero metadata footprints. Immediate asset sharding upon injection."
          icon={<Shield className="w-8 h-8 md:w-10 md:h-10" />}
          color="indigo"
        />
        <ActionCard 
          onClick={onAccessClick}
          title="Uplink"
          sub="Terminal Authorization"
          desc="Establish a secure encrypted handshake with your existing node using PIN verification."
          icon={<Activity className="w-8 h-8 md:w-10 md:h-10" />}
          color="slate"
        />
      </div>

      {/* Feature Matrix - Adaptive Layout */}
      <div className="mt-24 md:mt-56 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-20 w-full max-w-7xl px-8 border-t border-white/5 pt-16 md:pt-24">
        <FeatureItem 
          icon={<Fingerprint />}
          title="Zero Footprint"
          desc="Designed for silence. No logs, no emails, no traces of your digital existence."
        />
        <FeatureItem 
          icon={<Layers />}
          title="Redundancy"
          desc="Assets atomized into shards and distributed across a resilient cloud lattice."
        />
        <FeatureItem 
          icon={<Zap />}
          title="Insta-Export"
          desc="Compile your entire distributed vault into a secure locally-stored ZIP archive."
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
      className={`group relative overflow-hidden p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] transition-all duration-700 text-left glass-card flex flex-col items-start min-h-[350px] md:min-h-[500px] border-white/5 ${isIndigo ? 'hover:border-indigo-500/50' : 'hover:border-white/20'}`}
    >
      <div className="absolute inset-0 cyber-shimmer opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      
      <div className="mb-8 md:mb-12 p-4 md:p-6 bg-slate-900/50 rounded-2xl md:rounded-[2rem] border border-white/5 group-hover:scale-110 group-hover:bg-indigo-600 transition-all shadow-2xl group-hover:text-white text-indigo-500">
        {icon}
      </div>

      <div className="mt-auto">
        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-slate-500 mb-2 md:mb-4 block">{sub}</span>
        <h3 className="text-4xl md:text-6xl font-[1000] text-white italic uppercase tracking-tighter mb-4 md:mb-6 leading-none">{title}</h3>
        <p className="text-slate-400 text-base md:text-xl font-medium italic leading-relaxed mb-6 md:mb-10 max-w-sm">{desc}</p>
        
        <div className={`flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] ${isIndigo ? 'text-indigo-400' : 'text-slate-200'} group-hover:gap-6 md:group-hover:gap-8 transition-all`}>
          Execute Protocol <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
        </div>
      </div>
    </button>
  );
};

const FeatureItem = ({ icon, title, desc }: any) => (
  <div className="flex flex-col items-center text-center sm:items-start sm:text-left group">
    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-900/40 border border-white/5 flex items-center justify-center text-indigo-500 mb-6 md:mb-8 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl">
      {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6 md:w-8 md:h-8" })}
    </div>
    <h4 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter mb-2 md:mb-4">{title}</h4>
    <p className="text-slate-500 text-sm md:text-lg italic leading-relaxed font-medium">{desc}</p>
  </div>
);
