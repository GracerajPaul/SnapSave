
import React, { useState } from 'react';
import { Shield, LogOut, FileText, Info } from 'lucide-react';
import { APP_NAME, TAGLINE } from '../constants.tsx';
import { Vault } from '../types.ts';
import { TermsModal } from './TermsModal.tsx';

interface LayoutProps {
  children: React.ReactNode;
  activeVault: Vault | null;
  onLogout: () => void;
  onAboutClick?: () => void;
  onHomeClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeVault, onLogout, onAboutClick, onHomeClick }) => {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass-card px-4 py-3 md:px-8 border-b border-white/5">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={onHomeClick}
          >
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-indigo-600/20">
              <Shield className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-black bg-gradient-to-r from-indigo-300 to-cyan-400 bg-clip-text text-transparent leading-none italic uppercase tracking-tighter">
                {APP_NAME}
              </h1>
              <p className="text-[8px] md:text-[10px] text-slate-500 uppercase tracking-widest font-bold hidden xs:block">{TAGLINE}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={onAboutClick}
              className="p-2 md:p-0 text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1.5 text-xs font-black uppercase tracking-widest"
            >
              <Info className="w-4 h-4" />
              <span className="hidden md:inline">Intelligence</span>
            </button>

            {activeVault && (
              <div className="flex items-center gap-3 md:gap-4 border-l border-white/5 pl-3 md:pl-4">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-black text-white uppercase italic tracking-tighter truncate max-w-[100px]">{activeVault.vaultName || activeVault.username}</p>
                  <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Active Node</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2.5 text-slate-400 hover:text-red-400 transition-colors bg-white/5 rounded-xl border border-white/5 hover:border-red-500/20"
                  title="Terminate Session"
                >
                  <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-12 max-w-[1600px]">
        {children}
      </main>

      <footer className="py-12 border-t border-white/5 text-center space-y-6">
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-slate-600 text-[10px] font-black uppercase tracking-widest">
          <p>&copy; {new Date().getFullYear()} {APP_NAME} ARCHIVE</p>
          <span className="hidden sm:block w-1.5 h-1.5 bg-slate-800 rounded-full"></span>
          <button onClick={onAboutClick} className="hover:text-indigo-400 transition-all flex items-center gap-2">
            <Info className="w-3 h-3" /> INTEL
          </button>
          <span className="hidden sm:block w-1.5 h-1.5 bg-slate-800 rounded-full"></span>
          <button onClick={() => setShowTerms(true)} className="hover:text-indigo-400 transition-all flex items-center gap-2">
            <FileText className="w-3 h-3" /> PROTOCOL
          </button>
        </div>
        <p className="text-[9px] text-slate-800 uppercase tracking-[1em] font-black pl-[1em]">Chairman Graceraj Paul</p>
      </footer>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};
