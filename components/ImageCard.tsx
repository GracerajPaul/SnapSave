
import React, { useState, useEffect } from 'react';
import { 
  Download, Trash2, Check, Copy, Loader2, 
  File, FileArchive, FileCode, Image as ImageIcon, Maximize2, X, FileText 
} from 'lucide-react';
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
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  
  const mimeType = image.mimeType.toLowerCase();
  const isImage = mimeType.startsWith('image/');

  useEffect(() => {
    const hydrateAsset = async () => {
      // Check if current URL is still valid (if it's a blob from the same session)
      const isLocalBlob = displayUrl.startsWith('blob:');
      if (isLocalBlob) {
        try {
          const res = await fetch(displayUrl, { method: 'HEAD' });
          if (res.ok) return;
        } catch (e) {}
      }

      setResolving(true);
      // Re-fetch short-lived path from cloud nexus
      const cloudUrl = await TelegramService.getImageUrl(image.telegramFileId);
      if (cloudUrl) {
        setDisplayUrl(cloudUrl);
      }
      setResolving(false);
    };

    hydrateAsset();
  }, [image.telegramFileId]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isViewOnly || !displayUrl) return;
    const a = document.createElement('a');
    a.href = displayUrl;
    a.target = "_blank";
    a.download = image.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!displayUrl) return;
    navigator.clipboard.writeText(displayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderPreview = () => {
    if (resolving) {
      return (
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hydrating Shard...</span>
        </div>
      );
    }

    if (isImage) {
      return (
        <img 
          src={displayUrl || 'https://via.placeholder.com/400?text=Stream+Interrupted'} 
          alt={image.name} 
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=CORS+Blocked';
          }}
        />
      );
    }

    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <div className={`p-6 bg-slate-900 rounded-[2rem] border border-white/5 group-hover:scale-110 transition-all text-indigo-400`}>
           <File className="w-16 h-16" />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="group relative glass-card rounded-[2rem] overflow-hidden border-white/5 bg-slate-900/40 hover:shadow-[0_20px_50px_-20px_rgba(99,102,241,0.3)] transition-all duration-500 animate-in fade-in zoom-in-95">
        <div className="aspect-square w-full overflow-hidden bg-slate-950 relative flex items-center justify-center cursor-pointer">
          {renderPreview()}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
            {!resolving && (
              <div className="flex items-center justify-center gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                {!isViewOnly && (
                  <button onClick={handleDownload} className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-xl border border-white/10 transition-all hover:scale-110">
                    <Download className="w-5 h-5" />
                  </button>
                )}
                <button onClick={handleCopy} className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-xl border border-white/10 transition-all hover:scale-110">
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
                <button onClick={() => setIsCinemaMode(true)} className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-xl border border-white/10 transition-all hover:scale-110">
                  <Maximize2 className="w-5 h-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); if(confirm('Purge asset?')) onDelete(); }} className="p-4 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-2xl backdrop-blur-xl border border-red-500/20 transition-all hover:scale-110">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-indigo-500`}>
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-black text-white truncate italic uppercase tracking-tight">{image.name}</h4>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{formatSize(image.size)} Shard</p>
            </div>
          </div>
        </div>
      </div>

      {isCinemaMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <button onClick={() => setIsCinemaMode(false)} className="absolute top-8 right-8 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all">
            <X className="w-8 h-8" />
          </button>
          <div className="w-full max-w-5xl aspect-video relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            {isImage ? (
              <img src={displayUrl} className="w-full h-full object-contain" alt={image.name} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-6">
                <FileText className="w-24 h-24 text-indigo-400" />
                <h3 className="text-3xl font-black text-white uppercase italic">{image.name}</h3>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
