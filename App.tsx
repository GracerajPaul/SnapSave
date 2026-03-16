
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { VaultCreation } from './components/VaultCreation.tsx';
import { VaultAccess } from './components/VaultAccess.tsx';
import { VaultDashboard } from './components/VaultDashboard.tsx';
import { AboutPage } from './components/AboutPage.tsx';
import { Vault, isVaultExpired } from './types.ts';
import { StorageService } from './services/storageService.ts';
import { ShieldCheck } from 'lucide-react';

import { auth, db } from './firebase.ts';
import { signInAnonymously, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDocFromServer } from 'firebase/firestore';

const SESSION_KEY = 'snapsave_active_session';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'create' | 'access' | 'dashboard' | 'about'>('landing');
  const [activeVault, setActiveVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [connectionMode, setConnectionMode] = useState<'cloud' | 'local'>('cloud');

  // Initialize Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth);
          // Verify Firestore is reachable
          await getDocFromServer(doc(db, 'vaults', 'connection-test'));
          setConnectionMode('cloud');
        } catch (err: any) {
          console.warn('Cloud connection failed, switching to local mode:', err.code || err.message);
          setConnectionMode('local');
        }
      } else {
        try {
          await getDocFromServer(doc(db, 'vaults', 'connection-test'));
          setConnectionMode('cloud');
        } catch (err) {
          setConnectionMode('local');
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Initialize and check for existing session or URL vault access
  useEffect(() => {
    if (!isAuthReady) return;

    const init = async () => {
      try {
        // 1. Check URL for direct vault access via hash
        const hash = window.location.hash;
        const urlParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
        const vaultIdFromUrl = urlParams.get('vaultId');
        
        // 2. Check LocalStorage for an active session
        let savedVaultId = null;
        try {
          savedVaultId = localStorage.getItem(SESSION_KEY);
        } catch (e) {
          console.warn('LocalStorage access denied', e);
        }
        
        if (vaultIdFromUrl) {
          setView('access');
        } else if (savedVaultId) {
          try {
            const vault = await StorageService.getVaultById(savedVaultId);
            if (vault && !vault.isEmergencyLocked && !isVaultExpired(vault)) {
              setActiveVault(vault);
              setView('dashboard');
            } else {
              try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
            }
          } catch (e) {
            try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
          }
        }
      } catch (err: any) {
        console.error('Initialization error:', err);
        setError(err.message || 'System initialization failure');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleCreateSuccess = (vault: Vault) => {
    setActiveVault(vault);
    try {
      localStorage.setItem(SESSION_KEY, vault.id);
    } catch (e) {
      console.warn('LocalStorage access denied', e);
    }
    setView('dashboard');
  };

  const handleAccessSuccess = (vault: Vault) => {
    setActiveVault(vault);
    try {
      localStorage.setItem(SESSION_KEY, vault.id);
    } catch (e) {
      console.warn('LocalStorage access denied', e);
    }
    setView('dashboard');
  };

  const handleAdminLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Admin login failed:', err);
      setError('Admin authentication failed: ' + err.message);
    }
  };

  const handleLogout = () => {
    setActiveVault(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.warn('LocalStorage access denied', e);
    }
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
      connectionMode={connectionMode}
      onAdminLogin={handleAdminLogin}
    >
      <div className="atmosphere" />

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
            try {
              localStorage.setItem(SESSION_KEY, v.id);
            } catch (e) {}
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
