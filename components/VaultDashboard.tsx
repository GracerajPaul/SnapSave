
import React, { useState, useRef, useMemo } from 'react';
import { 
  Upload, Download, Share2, Eye, EyeOff, Trash2, 
  AlertTriangle, Settings, Grid, List, Check, Copy,
  Plus, X, FileArchive, Loader2, Search, Filter, 
  Database, Info, Clock, ShieldAlert
} from 'lucide-react';
import JSZip from 'jszip';
import { Vault, VaultImage, ExpiryOption } from '../types.ts';
import { MAX_FILE_SIZE, ICONS } from '../constants.tsx';
import { StorageService } from '../services/storageService.ts';
import { TelegramService } from '../services/telegramService.ts';
import { ImageCard } from './ImageCard.tsx';

interface VaultDashboardProps {
  vault: Vault;
  onVaultUpdate: (vault: Vault) => void;
  onExit: () => void;
}

export const VaultDashboard: React.FC<VaultDashboardProps> = ({ vault, onVaultUpdate, onExit }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ fileName: string, progress: number } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredImages = useMemo(() => {
    return vault.images.filter(img => 
      img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.mimeType.includes(searchQuery.toLowerCase())
    );
  }, [vault.images, searchQuery]);

  const totalSize = useMemo(() => {
    const bytes = vault.images.reduce((acc, img) => acc + img.size, 0);
    return (bytes / (1024 * 1024)).toFixed(2);
  }, [vault.images]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const updatedImages = [...vault.images];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > MAX_FILE_SIZE) {
          alert(`File ${file.name} exceeds 20MB limit`);
          continue;
        }

        setUploadStatus({ fileName: file.name, progress: 0 });

        const tgResult = await TelegramService.uploadImage(file, (progress) => {
          setUploadStatus({ fileName: file.name, progress: Math.round(progress) });
        });
        
        const newImage: VaultImage = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          mimeType: file.type,
          telegramFileId: tgResult.file_id,
          uploadedAt: Date.now(),
          url: URL.createObjectURL(file)
        };
        updatedImages.push(newImage);
      }

      const updatedVault = await StorageService.updateVaultImages(vault.id, updatedImages);
      onVaultUpdate(updatedVault);
    } catch (err) {
      console.error(err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadStatus(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleToggleViewOnly = async () => {
    const updated = await StorageService.updateVaultSettings(vault.id, { isViewOnly: !vault.isViewOnly });
    onVaultUpdate(updated);
  };

  const handleEmergencyLock = async () => {
    if (confirm('EMERGENCY: This will permanently lock access until manual recovery. Proceed?')) {
      await StorageService.updateVaultSettings(vault.id, { isEmergencyLocked: true });
      onExit();
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}${window.location.pathname}#?vaultId=${vault.id}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const downloadAllAsZip = async () => {
    if (vault.images.length === 0) return;
    setZipLoading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder("snapsave-images");
      
      for (const img of vault.images) {
        const response = await fetch(img.url);
        const blob = await response.blob();
        folder?.file(img.name, blob);
      }
      
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SnapSave_${vault.vaultName || vault.username}.zip`;
      a.click();
    } catch (err) {
      alert('ZIP generation failed');
    } finally {
      setZipLoading(false);
    }
  };

  const deleteVault = async () => {
    if (confirm('Are you sure you want to PERMANENTLY delete this vault?')) {
      await StorageService.deleteVault(vault.id);
      onExit();
    }
  };

  const getExpiryLabel = () => {
    switch(vault.expiry) {
      case ExpiryOption.ONE_DAY: return '24H AUTO-EXPIRY';
      case ExpiryOption.SEVEN_DAYS: return '7D AUTO-EXPIRY';
      case ExpiryOption.THIRTY_DAYS: return '30D AUTO-EXPIRY';
      case ExpiryOption.NEVER: return 'PERSISTENT VAULT';
      default: return 'AUTO-EXPIRY';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Dynamic Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Database className="w-4 h-4" />} label="Storage Used" value={`${totalSize} MB`} color="text-indigo-400" />
        <StatCard icon={<Grid className="w-4 h-4" />} label="Snap Count" value={vault.images.length.toString()} color="text-cyan-400" />
        <StatCard icon={<Clock className="w-4 h-4" />} label="Session Type" value={vault.expiry === ExpiryOption.NEVER ? 'Persistent' : 'Ephemeral'} color="text-emerald-400" />
        <StatCard icon={<ShieldAlert className="w-4 h-4" />} label="Status" value={vault.isViewOnly ? 'Read Only' : 'Full Access'} color="text-orange-400" />
      </div>

      {/* Main Command Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 glass-card p-8 rounded-[2.5rem] border-white/5 bg-slate-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">
              {vault.vaultName || "The Nexus Vault"}
            </h2>
            <div className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-full">
              {getExpiryLabel()}
            </div>
          </div>
          <p className="text-slate-500 font-mono text-sm flex items-center gap-2">
            <span className="opacity-50">NODE:</span> {vault.username} 
            <span className="w-1 h-1 bg-slate-700 rounded-full" />
            <span className="opacity-50">UID:</span> {vault.id}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 relative z-10">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text"
              placeholder="Filter snaps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all w-full sm:w-64 text-white"
            />
          </div>

          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-3 px-6 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-200 rounded-2xl transition-all border border-slate-700/50 hover:border-indigo-500/30 active:scale-95"
          >
            {copySuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span className="text-sm font-bold uppercase tracking-tight">{copySuccess ? 'Copied' : 'Share'}</span>
          </button>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-2xl transition-all border ${showSettings ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white active:scale-95'}`}
          >
            <Settings className="w-5 h-5" />
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-3 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black italic uppercase tracking-widest shadow-xl shadow-indigo-600/20 disabled:bg-indigo-800 transition-all active:scale-95"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Upload
          </button>
          <input 
            type="file" 
            multiple 
            accept="image/jpeg,image/png,image/webp"
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
        </div>
      </div>

      {/* Upload Progress Overlay */}
      {uploadStatus && (
        <div className="glass-card p-6 rounded-[2rem] border-indigo-500/30 animate-in fade-in slide-in-from-top-4 duration-300 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Upload className="w-4 h-4 text-indigo-400 animate-bounce" />
              </div>
              <div>
                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Injecting Data Stream</span>
                <span className="block text-sm font-black text-white italic truncate max-w-[200px] sm:max-w-md">
                  {uploadStatus.fileName}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress</span>
              <span className="block text-lg font-mono font-black text-indigo-400">{uploadStatus.progress}%</span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
              style={{ width: `${uploadStatus.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Settings Grid */}
      {showSettings && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-500">
          <ControlTile 
            onClick={handleToggleViewOnly}
            active={vault.isViewOnly}
            icon={vault.isViewOnly ? <EyeOff className="text-orange-400" /> : <Eye className="text-indigo-400" />}
            label="View-Only Defense"
            desc="Block unauthorized snap downloads"
            toggle
          />

          <ControlTile 
            onClick={handleEmergencyLock}
            icon={<AlertTriangle className="text-red-500" />}
            label="Emergency Lock"
            desc="Freeze vault access immediately"
            danger
          />

          <ControlTile 
            onClick={deleteVault}
            icon={<Trash2 className="text-slate-500" />}
            label="Annihilate Vault"
            desc="Permanent cryptographic destruction"
            danger
          />
        </div>
      )}

      {/* Gallery Nexus */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
            Gallery Nexus
            <span className="text-xs font-black text-slate-500 bg-slate-900 border border-slate-800 px-4 py-1 rounded-full uppercase tracking-widest">
              {filteredImages.length} Active Snaps
            </span>
          </h3>
          
          {vault.images.length > 0 && !vault.isViewOnly && (
            <button 
              onClick={downloadAllAsZip}
              disabled={zipLoading}
              className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-all group"
            >
              {zipLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileArchive className="w-4 h-4 group-hover:scale-110 transition-transform" />}
              Bulk Export
            </button>
          )}
        </div>

        {filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 glass-card rounded-[3rem] border-dashed border-slate-800 group hover:border-indigo-500/30 transition-all">
            <div className="p-8 bg-slate-900/50 rounded-[2.5rem] mb-6 group-hover:scale-110 transition-transform">
              <Upload className="w-12 h-12 text-slate-700 group-hover:text-indigo-500" />
            </div>
            <p className="text-slate-400 font-black italic uppercase tracking-widest text-xl mb-2">Nexus Empty</p>
            <p className="text-slate-600 text-sm font-medium">Inject data streams to begin vault population.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((img) => (
              <ImageCard 
                key={img.id} 
                image={img} 
                isViewOnly={vault.isViewOnly} 
                onDelete={async () => {
                  const updated = vault.images.filter(i => i.id !== img.id);
                  const v = await StorageService.updateVaultImages(vault.id, updated);
                  onVaultUpdate(v);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => (
  <div className="glass-card p-5 rounded-[1.5rem] border-white/5 bg-slate-900/40">
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2 bg-slate-950 rounded-lg ${color}`}>{icon}</div>
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-xl font-black text-white italic tracking-tight">{value}</div>
  </div>
);

const ControlTile = ({ onClick, icon, label, desc, active, toggle, danger }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-between p-6 glass-card rounded-[2rem] border border-white/5 transition-all group text-left ${danger ? 'hover:border-red-500/40 hover:bg-red-500/5' : 'hover:border-indigo-500/40'}`}
  >
    <div className="flex items-center gap-5">
      <div className={`p-4 bg-slate-900 rounded-2xl group-hover:scale-110 transition-transform ${danger ? 'text-red-500' : 'text-indigo-400'}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-black text-white uppercase italic tracking-tight">{label}</p>
        <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
      </div>
    </div>
    {toggle && (
      <div className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${active ? 'bg-indigo-600' : 'bg-slate-800'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-lg ${active ? 'right-1' : 'left-1'}`} />
      </div>
    )}
  </button>
);
