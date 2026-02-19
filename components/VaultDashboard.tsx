
import React, { useState, useRef, useMemo } from 'react';
import { 
  Upload, Download, Trash2, Settings, Check, 
  FileArchive, Loader2, Search, Database, Clock, 
  ShieldAlert, Image as ImageIcon, HardDrive, Network,
  Languages, CheckSquare, X, ListFilter, Command, Activity
} from 'lucide-react';
import JSZip from 'jszip';
import { Vault, VaultImage, ExpiryOption } from '../types.ts';
import { MAX_FILE_SIZE } from '../constants.tsx';
import { StorageService } from '../services/storageService.ts';
import { TelegramService } from '../services/telegramService.ts';
import { ImageCard } from './ImageCard.tsx';

// Comprehensive Translation Engine
const TRANSLATIONS: Record<string, any> = {
  en: {
    dashboardTitle: "Nexus Dashboard",
    storageUsed: "Usage",
    remainingCap: "Node Capacity",
    sessionType: "Node Class",
    status: "Encryption",
    searchPlaceholder: "Search node stream...",
    injectImages: "Inject Shards",
    bulkExport: "Export All (ZIP)",
    activeNodes: "Nodes",
    selectionMode: "Selection Mode",
    downloadSelected: "Export Selection (ZIP)",
    exportModalTitle: "Archival Protocol",
    exportAll: "Full Export to ZIP",
    exportSelected: "Selective Export to ZIP",
    compiling: "Compiling binary streams...",
    cancel: "Abort",
    emptyVault: "Nexus Empty",
    injectPrompt: "No active shards identified in stream.",
    processing: "Hydrating Shard",
    saving: "Encrypting Archive...",
    success: "Handshake Complete",
  },
  es: {
    dashboardTitle: "Panel Nexus",
    storageUsed: "Uso",
    remainingCap: "Capacidad",
    sessionType: "Clase",
    status: "Cifrado",
    searchPlaceholder: "Buscar flujo...",
    injectImages: "Inyectar",
    bulkExport: "Exportar (ZIP)",
    activeNodes: "Nodos",
    selectionMode: "Selección",
    downloadSelected: "Descargar (ZIP)",
    exportModalTitle: "Protocolo de Archivo",
    exportAll: "Exportación Total",
    exportSelected: "Exportación Parcial",
    compiling: "Compilando flujos...",
    cancel: "Abortar",
    emptyVault: "Nexus Vacío",
    injectPrompt: "No se identifican fragmentos activos.",
    processing: "Hidratando fragmento",
    saving: "Cifrando archivo...",
    success: "Handshake completado",
  }
};

interface VaultDashboardProps {
  vault: Vault;
  onVaultUpdate: (vault: Vault) => void;
  onExit: () => void;
}

export const VaultDashboard: React.FC<VaultDashboardProps> = ({ vault, onVaultUpdate, onExit }) => {
  const [lang, setLang] = useState('en');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ fileName: string, progress: number } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [zipStatus, setZipStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const filteredAssets = useMemo(() => {
    return vault.images.filter(img => 
      img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.mimeType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vault.images, searchQuery]);

  const totalSize = useMemo(() => {
    const bytes = vault.images.reduce((acc, img) => acc + img.size, 0);
    return (bytes / (1024 * 1024)).toFixed(2);
  }, [vault.images]);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const updatedImages = [...vault.images];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > MAX_FILE_SIZE) {
          alert(`CRITICAL: "${file.name}" exceeds 50MB protocol limit.`);
          continue;
        }
        setUploadStatus({ fileName: file.name, progress: 0 });
        try {
          const tgResult = await TelegramService.uploadFile(file, (progress) => {
            setUploadStatus({ fileName: file.name, progress: Math.round(progress) });
          });
          const newAsset: VaultImage = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            mimeType: file.type || 'application/octet-stream',
            telegramFileId: tgResult.file_id,
            uploadedAt: Date.now(),
            url: URL.createObjectURL(file)
          };
          updatedImages.push(newAsset);
        } catch (uploadErr: any) {
          alert(`INJECTION FAILED: ${uploadErr.message}`);
          break;
        }
      }
      const updatedVault = await StorageService.updateVaultImages(vault.id, updatedImages);
      onVaultUpdate(updatedVault);
    } finally {
      setUploading(false);
      setUploadStatus(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const executeExport = async (mode: 'all' | 'selected') => {
    const targets = mode === 'all' 
      ? vault.images 
      : vault.images.filter(img => selectedIds.has(img.id));
    
    if (targets.length === 0) return;
    
    setZipLoading(true);
    setShowExportModal(false);
    let successCount = 0;

    try {
      const zip = new JSZip();
      const folder = zip.folder(`${vault.username}_Archive`);
      
      for (let i = 0; i < targets.length; i++) {
        const img = targets[i];
        setZipStatus(`${t.processing}: ${img.name.slice(0, 12)}... (${i + 1}/${targets.length})`);
        
        try {
          const rawUrl = await TelegramService.getImageUrl(img.telegramFileId);
          if (!rawUrl) throw new Error();
          
          const proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rawUrl)}`;
          const response = await fetch(proxiedUrl);
          if (!response.ok) throw new Error();
          
          const data = await response.arrayBuffer();
          folder?.file(img.name, data, { binary: true });
          successCount++;
        } catch (err) {
          console.error(`Fetch failure: ${img.name}`);
        }
      }

      if (successCount === 0) throw new Error('Hydration sequence failed.');

      setZipStatus(t.saving);
      const content = await zip.generateAsync({ type: "blob", mimeType: "application/zip" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SnapSave_${vault.username}_Archive.zip`;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 500);

    } catch (err: any) {
      alert(`ARCHIVAL ERROR: ${err.message}`);
    } finally {
      setZipLoading(false);
      setZipStatus('');
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* HUD Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <HUDCard icon={<Database />} label={t.storageUsed} value={`${totalSize} MB`} />
        <HUDCard icon={<Activity />} label={t.remainingCap} value="∞ Infinite" pulse />
        <HUDCard icon={<Clock />} label={t.sessionType} value={vault.expiry === ExpiryOption.NEVER ? 'Persistent' : 'Ephemeral'} />
        <HUDCard icon={<ShieldAlert />} label={t.status} value={vault.isViewOnly ? 'Read Only' : 'Active'} color="cyan" />
      </div>

      {/* Main Command Center */}
      <div className="glass-card p-10 rounded-[3rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] pointer-events-none group-hover:bg-indigo-600/10 transition-all duration-1000"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Uplink Established</span>
            </div>
            <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none mb-3">
              {vault.vaultName || t.dashboardTitle}
            </h2>
            <div className="flex items-center gap-4">
               <div className="px-3 py-1 bg-slate-950 border border-white/5 rounded-lg">
                  <span className="text-xs font-mono text-indigo-400 font-bold tracking-widest">{vault.username}</span>
               </div>
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Encrypted Node ID</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative group/search">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/search:text-indigo-400 transition-colors" />
              <input 
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 w-full sm:w-80 text-white placeholder:text-slate-700 transition-all"
              />
            </div>

            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black italic uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {t.injectImages}
            </button>

            <button 
              onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
              className="p-4 bg-slate-800/30 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all flex items-center gap-3"
            >
              <Languages className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{lang}</span>
            </button>

            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-4 rounded-2xl border transition-all ${showSettings ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/30' : 'bg-slate-800/30 border-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Settings className="w-5 h-5" />
            </button>

            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      {(uploadStatus || zipLoading) && (
        <div className="glass-card p-8 rounded-[2.5rem] border-indigo-500/20 animate-in slide-in-from-top-4 duration-500 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg"><Command className="w-4 h-4 text-indigo-400 animate-spin-slow" /></div>
              <span className="text-sm font-black text-white italic tracking-wide uppercase">
                {zipLoading ? zipStatus : `${uploadStatus?.fileName}`}
              </span>
            </div>
            {uploadStatus && <span className="text-lg font-mono font-black text-indigo-400">{uploadStatus.progress}%</span>}
          </div>
          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <div 
              className={`h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-300 ${zipLoading ? 'animate-pulse' : ''}`} 
              style={{ width: zipLoading ? '100%' : `${uploadStatus?.progress}%` }} 
            />
          </div>
        </div>
      )}

      {/* Grid Controls */}
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="flex items-center gap-8">
          <h3 className="text-3xl font-[900] text-white italic uppercase tracking-tighter flex items-center gap-4">
            <Network className="w-6 h-6 text-indigo-400" />
            Shard Stream
          </h3>
          <button 
            onClick={() => { setSelectionMode(!selectionMode); setSelectedIds(new Set()); }}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-3 ${selectionMode ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'}`}
          >
            <ListFilter className="w-4 h-4" />
            {t.selectionMode}
          </button>
        </div>

        <div className="flex items-center gap-6">
          {selectionMode && selectedIds.size > 0 && (
            <button 
              onClick={() => executeExport('selected')}
              className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all flex items-center gap-3 shadow-xl shadow-indigo-600/20"
            >
              Download Selection ({selectedIds.size})
            </button>
          )}
          <button 
            onClick={() => setShowExportModal(true)} 
            disabled={zipLoading || vault.images.length === 0} 
            className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 hover:text-indigo-400 transition-all flex items-center gap-3 group/exp"
          >
            <FileArchive className="w-4 h-4 group-hover/exp:scale-110 transition-transform" /> {t.bulkExport}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      {filteredAssets.length === 0 ? (
        <div className="py-48 text-center glass-card rounded-[4rem] border-dashed border-slate-800 bg-transparent group">
           <ImageIcon className="w-16 h-16 text-slate-800 mx-auto mb-6 group-hover:scale-110 transition-transform group-hover:text-indigo-900" />
           <p className="text-slate-600 font-black uppercase tracking-[0.5em] italic text-xl">{t.emptyVault}</p>
           <p className="text-slate-800 text-[10px] uppercase font-bold mt-4 tracking-widest">{t.injectPrompt}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredAssets.map((img) => (
            <div key={img.id} className="relative group/it">
              {selectionMode && (
                <div 
                  className="absolute top-5 left-5 z-30 cursor-pointer"
                  onClick={() => toggleSelection(img.id)}
                >
                  {selectedIds.has(img.id) ? (
                    <div className="bg-indigo-600 p-2.5 rounded-xl border border-white/20 shadow-2xl shadow-indigo-600/50"><Check className="w-4 h-4 text-white" /></div>
                  ) : (
                    <div className="bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-white/10 hover:border-indigo-500/50 transition-all"><div className="w-4 h-4" /></div>
                  )}
                </div>
              )}
              <div className={selectionMode ? 'opacity-60 scale-95 transition-all pointer-events-none' : 'transition-all'}>
                <ImageCard 
                  image={img} 
                  isViewOnly={vault.isViewOnly} 
                  onDelete={async () => {
                    if(!confirm('Annihilate shard?')) return;
                    const updated = vault.images.filter(i => i.id !== img.id);
                    const v = await StorageService.updateVaultImages(vault.id, updated);
                    onVaultUpdate(v);
                  }} 
                />
              </div>
              {selectionMode && (
                <div className="absolute inset-0 z-20 cursor-pointer" onClick={() => toggleSelection(img.id)} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Export Protocol Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="glass-card w-full max-w-xl p-16 rounded-[4rem] border-white/10 relative text-center shadow-[0_0_150px_-30px_rgba(99,102,241,0.3)]">
            <button onClick={() => setShowExportModal(false)} className="absolute top-10 right-10 text-slate-500 hover:text-white transition-all"><X className="w-8 h-8" /></button>
            <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center mb-10 shadow-2xl shadow-indigo-600/40">
              <FileArchive className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-6">{t.exportModalTitle}</h3>
            <p className="text-slate-500 mb-12 italic leading-relaxed text-lg px-6">Archive shards into a single compiled binary ZIP stream. Select scope to proceed.</p>
            
            <div className="grid grid-cols-1 gap-6">
              <ExportOptionBtn onClick={() => executeExport('all')} label={t.exportAll} sub={`${vault.images.length} Shards Identified`} color="indigo" />
              <ExportOptionBtn onClick={() => { setShowExportModal(false); setSelectionMode(true); }} label={t.exportSelected} sub="Manual Stream Selection" color="slate" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HUDCard = ({ icon, label, value, color, pulse }: any) => (
  <div className="glass-card p-8 rounded-[2rem] bg-slate-900/20 border border-white/5 group hover:border-indigo-500/20 transition-all">
    <div className="flex items-center gap-4 mb-4">
      <div className={`p-2.5 bg-slate-950 border border-white/5 rounded-xl ${color === 'cyan' ? 'text-cyan-400' : 'text-indigo-400'} ${pulse ? 'animate-pulse' : ''} group-hover:scale-110 transition-transform`}>{icon}</div>
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{label}</span>
    </div>
    <div className="text-3xl font-black text-white italic tracking-tighter">{value}</div>
  </div>
);

const ExportOptionBtn = ({ onClick, label, sub, color }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-between p-8 rounded-[2rem] border transition-all group active:scale-95 ${color === 'indigo' ? 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/20' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'}`}
  >
    <div className="text-left">
      <p className="text-xl font-black uppercase italic tracking-tight">{label}</p>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1 opacity-60">{sub}</p>
    </div>
    <Download className={`w-7 h-7 ${color === 'indigo' ? 'text-white' : 'text-indigo-500'} group-hover:translate-y-1 transition-transform`} />
  </button>
);
