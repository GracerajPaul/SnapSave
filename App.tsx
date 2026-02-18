
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { VaultCreation } from './components/VaultCreation.tsx';
import { VaultAccess } from './components/VaultAccess.tsx';
import { VaultDashboard } from './components/VaultDashboard.tsx';
import { AboutPage } from './components/AboutPage.tsx';
import { Vault } from './types.ts';
import { StorageService } from './services/storageService.ts';

const SESSION_KEY = 'snapsave_active_session';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'create' | 'access' | 'dashboard' | 'about'>('landing');
  const [activeVault, setActiveVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and check for existing session or URL vault access
  useEffect(() => {
    const init = async () => {
      // 1. Check URL for direct vault access via hash
      const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
      const vaultIdFromUrl = urlParams.get('vaultId');
      
      // 2. Check LocalStorage for an active session
      const savedVaultId = localStorage.getItem(SESSION_KEY);
      
      if (vaultIdFromUrl) {
        setView('access');
      } else if (savedVaultId) {
        try {
          const vault = await StorageService.getVaultById(savedVaultId);
          if (vault && !vault.isEmergencyLocked) {
            setActiveVault(vault);
            setView('dashboard');
          } else {
            localStorage.removeItem(SESSION_KEY);
          }
        } catch (e) {
          localStorage.removeItem(SESSION_KEY);
        }
      }
      
      setLoading(false);
    };
    init();
  }, []);

  const handleCreateSuccess = (vault: Vault) => {
    setActiveVault(vault);
    localStorage.setItem(SESSION_KEY, vault.id);
    setView('dashboard');
  };

  const handleAccessSuccess = (vault: Vault) => {
    setActiveVault(vault);
    localStorage.setItem(SESSION_KEY, vault.id);
    setView('dashboard');
  };

  const handleLogout = () => {
    setActiveVault(null);
    localStorage.removeItem(SESSION_KEY);
    setView('landing');
    // Clear any hash
    window.location.hash = '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Layout 
      activeVault={activeVault} 
      onLogout={handleLogout} 
      onAboutClick={() => setView('about')}
      onHomeClick={() => setView('landing')}
    >
      {view === 'landing' && (
        <LandingPage 
          onCreateClick={() => setView('create')} 
          onAccessClick={() => setView('access')} 
        />
      )}
      {view === 'create' && (
        <VaultCreation 
          onSuccess={handleCreateSuccess} 
          onCancel={() => setView('landing')} 
        />
      )}
      {view === 'access' && (
        <VaultAccess 
          onSuccess={handleAccessSuccess} 
          onCancel={() => setView('landing')} 
        />
      )}
      {view === 'dashboard' && activeVault && (
        <VaultDashboard 
          vault={activeVault} 
          onVaultUpdate={(v) => {
            setActiveVault(v);
            // Ensure session is kept updated
            localStorage.setItem(SESSION_KEY, v.id);
          }}
          onExit={handleLogout}
        />
      )}
      {view === 'about' && (
        <AboutPage onBack={() => setView(activeVault ? 'dashboard' : 'landing')} />
      )}
    </Layout>
  );
};

export default App;
