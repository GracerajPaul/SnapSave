
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
      <header className="sticky top-0 z-50 glass-card px-4 py-3 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={onHomeClick}
          >
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent leading-none">
                {APP_NAME}
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">{TAGLINE}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onAboutClick}
              className="text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1.5 text-sm font-medium"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">About</span>
            </button>

            {activeVault && (
              <div className="flex items-center gap-4 border-l border-slate-800 pl-4">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-slate-200">{activeVault.vaultName || activeVault.username}</p>
                  <p className="text-xs text-slate-500">Active Session</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors bg-slate-800/50 rounded-lg"
                  title="Log Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>

      <footer className="py-8 border-t border-slate-900 text-center space-y-4">
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}</p>
          <span className="hidden sm:block w-1 h-1 bg-slate-700 rounded-full"></span>
          <button 
            onClick={onAboutClick}
            className="hover:text-indigo-400 transition-colors flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            About Us
          </button>
          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
          <button 
            onClick={() => setShowTerms(true)}
            className="hover:text-indigo-400 transition-colors flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            Terms & Conditions
          </button>
        </div>
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.6em] font-black">Chairman Graceraj Paul</p>
      </footer>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};
