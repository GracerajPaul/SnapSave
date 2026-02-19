
import React, { useState, useEffect } from 'react';
import { 
  Download, Trash2, Check, Copy, Loader2, 
  File, Image as ImageIcon, Maximize2, X, FileText 
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
      const isLocalBlob = displayUrl.startsWith('blob:');
      if (isLocalBlob) {
        try {
          const res = await fetch(displayUrl, { method: 'HEAD' });
          if (res.ok) return;
        } catch (e) {}
      }

      setResolving(true);
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
        <div className="flex flex-col items-center gap-5 animate-in fade-in duration-700">
          <div className="p-4 bg-indigo-500/10 rounded-full">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          </div>
          <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">Hydrating Shard</span>
        </div>
      );
    }

    if (isImage) {
      return (
        <img 
          src={displayUrl || 'https://via.placeholder.com/400?text=Stream+Interrupted'} 
          alt={image.name} 
          className="w-full h-full object-cover transition-all duration-[2000ms] ease-out group-hover:scale-110"
        />
      );
    }

    return (
      <div className="flex flex-col items-center gap-6 p-12">
        <div className={`p-8 bg-slate-900/60 rounded-[3rem] border border-white/5 group-hover:scale-110 transition-all duration-700 text-indigo-500 shadow-2xl`}>
           <File className="w-20 h-20" />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="group relative glass-card rounded-[3rem] overflow-hidden border-white/5 bg-slate-950/40 hover:shadow-[0_40px_80px_-25px_rgba(0,0,0,0.8)] transition-all duration-700 animate-in fade-in zoom-in-95">
        <div className="aspect-square w-full overflow-hidden bg-slate-950 relative flex items-center justify-center cursor-pointer">
          {renderPreview()}
          
          {/* Advanced Interaction Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-8">
            {!resolving && (
              <div className="flex items-center justify-center gap-4 translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
                {!isViewOnly && (
                  <button onClick={handleDownload} className="p-5 bg-white/10 hover:bg-indigo-600 text-white rounded-[1.5rem] backdrop-blur-2xl border border-white/10 transition-all hover:scale-110 active:scale-95 shadow-2xl">
                    <Download className="w-6 h-6" />
                  </button>
                )}
                <button onClick={handleCopy} className="p-5 bg-white/10 hover:bg-indigo-600 text-white rounded-[1.5rem] backdrop-blur-2xl border border-white/10 transition-all hover:scale-110 active:scale-95 shadow-2xl">
                  {copied ? <Check className="w-6 h-6 text-emerald-400" /> : <Copy className="w-6 h-6" />}
                </button>
                <button onClick={() => setIsCinemaMode(true)} className="p-5 bg-white/10 hover:bg-indigo-600 text-white rounded-[1.5rem] backdrop-blur-2xl border border-white/10 transition-all hover:scale-110 active:scale-95 shadow-2xl">
                  <Maximize2 className="w-6 h-6" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-5 bg-red-600/20 hover:bg-red-600 text-red-100 rounded-[1.5rem] backdrop-blur-2xl border border-red-500/20 transition-all hover:scale-110 active:scale-95 shadow-2xl">
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 relative z-10">
          <div className="flex items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-indigo-400 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500`}>
              <ImageIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-lg font-black text-white truncate italic uppercase tracking-tighter leading-none mb-2">{image.name}</h4>
              <div className="flex items-center gap-3">
                 <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">{formatSize(image.size)}</span>
                 <div className="w-1 h-1 rounded-full bg-slate-800" />
                 <span className="text-[10px] text-slate-700 font-black uppercase tracking-[0.3em] truncate">{mimeType.split('/')[1]} Protocol</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic Asset View */}
      {isCinemaMode && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/98 backdrop-blur-[50px] animate-in fade-in duration-700">
          <button onClick={() => setIsCinemaMode(false)} className="absolute top-12 right-12 p-5 bg-white/5 hover:bg-red-600 rounded-full text-white transition-all duration-500 hover:rotate-90">
            <X className="w-10 h-10" />
          </button>
          <div className="w-full max-w-[90vw] max-h-[80vh] relative flex items-center justify-center">
            {isImage ? (
              <img src={displayUrl} className="w-full h-full object-contain rounded-3xl shadow-[0_0_100px_rgba(0,0,0,1)]" alt={image.name} />
            ) : (
              <div className="flex flex-col items-center justify-center gap-12 text-center p-20 glass-card rounded-[5rem]">
                <FileText className="w-32 h-32 text-indigo-500" />
                <div>
                  <h3 className="text-6xl font-[1000] text-white uppercase italic tracking-tighter mb-4 leading-none">{image.name}</h3>
                  <p className="text-slate-500 font-black uppercase tracking-[0.5em]">{formatSize(image.size)} Asset Shard</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
