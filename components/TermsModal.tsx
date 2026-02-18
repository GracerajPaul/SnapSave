
import React from 'react';
import { X, ShieldCheck, AlertCircle, Trash2, Lock } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl border border-slate-700">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-indigo-500 w-6 h-6" />
            Terms and Conditions
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-slate-300">
          <section>
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" /> 1. Service Overview
            </h3>
            <p className="text-sm leading-relaxed">
              SnapSave provides a registration-free, PIN-protected image storage service. By using this service, you understand that access is granted solely via your chosen Username and PIN. We do not recover lost credentials.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> 2. Privacy & Data
            </h3>
            <p className="text-sm leading-relaxed">
              We do not collect emails, passwords, or personal identity information. Your images are stored securely via the Telegram Bot API. Metadata is stored locally or in a temporary database. PINs are hashed using industry-standard encryption (bcrypt).
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-400" /> 3. Data Retention & Deletion
            </h3>
            <p className="text-sm leading-relaxed">
              Vaults are subject to auto-deletion based on your selected preference (24h, 7d, 30d). If you select "Never", your data persists until manually deleted or until service maintenance requires removal. Emergency locking or multiple failed PIN attempts may result in permanent access loss.
            </p>
          </section>

          <section>
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-400" /> 4. Acceptable Use
            </h3>
            <p className="text-sm leading-relaxed">
              Users are prohibited from storing illegal, harmful, or copyright-infringing content. SnapSave reserves the right to terminate vaults that violate these terms or disrupt the service.
            </p>
          </section>

          <section className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 uppercase font-bold mb-2">Disclaimer</p>
            <p className="text-xs leading-relaxed italic">
              SnapSave is provided "as is" without warranties of any kind. We are not liable for any data loss, unauthorized access resulting from weak PINs, or service interruptions.
            </p>
          </section>
        </div>

        <div className="p-6 bg-slate-900/50 border-t border-slate-800 text-center">
          <button 
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-8 rounded-xl transition-all"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
