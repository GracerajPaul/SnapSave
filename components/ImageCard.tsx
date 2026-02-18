
import React, { useState, useEffect } from 'react';
import { Download, Trash2, FileText, Check, Copy, ExternalLink, Shield, Loader2 } from 'lucide-react';
import { VaultImage } from '../types.ts';
import { TelegramService } from '../services/telegramService.ts';

interface ImageCardProps {
  image: VaultImage;
  isViewOnly: boolean;
  onDelete: () => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, isViewOnly, onDelete }) => {
  const [displayUrl, setDisplayUrl] = useState<string>(image.url);
  const [resolving, setResolving] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  // Cross-device hydration: If the URL is a local blob (from a different device/session)
  // or empty, we fetch the actual Telegram link.
  useEffect(() => {
    const hydrateImage = async () => {
      const isLocalBlob = displayUrl.startsWith('blob:');
      
      // If it's a blob, check if it's still valid in THIS session
      if (isLocalBlob) {
        try {
          const res = await fetch(displayUrl, { method: 'HEAD' });
          if (res.ok) return; // Local blob is still alive
        } catch (e) {
          // Blob expired or from another device
        }
      }

      // If we got here, we need to fetch a fresh URL from Telegram
      setResolving(true);
      const cloudUrl = await TelegramService.getImageUrl(image.telegramFileId);
      if (cloudUrl) {
        setDisplayUrl(cloudUrl);
      }
      setResolving(false);
    };

    hydrateImage();
  }, [image.telegramFileId]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    if (isViewOnly || !displayUrl) return;
    const a = document.createElement('a');
    a.href = displayUrl;
    a.download = image.name;
    a.click();
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!displayUrl) return;
    navigator.clipboard.writeText(displayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative glass-card rounded-[2rem] overflow-hidden border-white/5 bg-slate-900/40 hover:shadow-[0_20px_50px_-20px_rgba(99,102,241,0.3)] transition-all duration-500 animate-in fade-in zoom-in-95">
      {/* Security Shield Badge */}
      <div className="absolute top-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="p-2 bg-slate-950/80 backdrop-blur-md rounded-xl border border-white/10 text-indigo-400">
            <Shield className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Image Preview Engine */}
      <div className="aspect-square w-full overflow-hidden bg-slate-950 relative flex items-center justify-center">
        {resolving ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hydrating Snap...</span>
          </div>
        ) : (
          <img 
            src={displayUrl || 'https://via.placeholder.com/400?text=Stream+Interrupted'} 
            alt={image.name} 
            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
          />
        )}
        
        {/* Elite Overlay Interface */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
          {!resolving && (
            <div className="flex items-center justify-center gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              {!isViewOnly && (
                <button 
                  onClick={handleDownload}
                  className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-xl border border-white/10 transition-all hover:scale-110 active:scale-95 shadow-2xl"
                  title="Download Stream"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={handleCopy}
                className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-xl border border-white/10 transition-all hover:scale-110 active:scale-95 shadow-2xl"
                title="Copy Reference"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => window.open(displayUrl, '_blank')}
                className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-xl border border-white/10 transition-all hover:scale-110 active:scale-95 shadow-2xl"
                title="Full Nexus View"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
              <button 
                onClick={() => { if(confirm('Purge snap from nexus?')) onDelete(); }}
                className="p-4 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-2xl backdrop-blur-xl border border-red-500/20 transition-all hover:scale-110 active:scale-95 shadow-2xl"
                title="Delete Forever"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metadata Footer */}
      <div className="p-5 relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-black text-white truncate italic uppercase tracking-tight" title={image.name}>
              {image.name}
            </h4>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{image.mimeType.split('/')[1] || 'Unknown'}</p>
          </div>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Magnitude</span>
            <span className="text-xs font-mono font-bold text-slate-400">{formatSize(image.size)}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Observed</span>
            <span className="text-xs font-mono font-bold text-slate-400">{new Date(image.uploadedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
