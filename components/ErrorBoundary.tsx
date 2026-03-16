
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let displayError = this.state.error?.message || 'An unexpected error occurred';
      
      // Try to parse JSON error if it's from Firestore
      try {
        if (displayError.startsWith('{')) {
          const parsed = JSON.parse(displayError);
          displayError = `Firestore ${parsed.operationType} failure: ${parsed.error}`;
        }
      } catch (e) {}

      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-10 md:p-16 bg-red-500/5 border border-red-500/20 rounded-[3rem] max-w-2xl shadow-2xl backdrop-blur-xl">
            <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-600/20">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-5xl font-[1000] text-white uppercase italic tracking-tighter mb-6 leading-none">System Breach Detected</h2>
            <div className="bg-slate-950/80 p-6 rounded-2xl border border-white/5 mb-10 text-left">
              <p className="text-red-400 font-mono text-xs md:text-sm break-words leading-relaxed">
                {displayError}
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-4 group"
            >
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
              Reboot Nexus
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
