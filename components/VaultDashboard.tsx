
import React, { useState, useRef, useMemo } from 'react';
import { 
  Upload, Download, Trash2, Settings, Check, 
  FileArchive, Loader2, Search, Database, Clock, 
  ShieldAlert, Image as ImageIcon, HardDrive, Network,
  Languages, X, ListFilter, Command, Activity, Terminal
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
    dashboardTitle: "Nexus Operational",
    storageUsed: "Usage",
    remainingCap: "Density",
    sessionType: "Protocol",
    status: "Encryption",
    searchPlaceholder: "Filter shard stream...",
    injectImages: "Inject Assets",
    bulkExport: "Export All",
    activeNodes: "Nodes",
    selectionMode: "Selection",
    downloadSelected: "Archive Selection",
    exportModalTitle: "Archival Protocol",
    exportAll: "Full Stream Export",
    exportSelected: "Segmented Export",
    compiling: "Compiling streams...",
    cancel: "Abort",
    emptyVault: "Nexus Idle",
    injectPrompt: "No active shards detected.",
    processing: "Hydrating",
    saving: "Encrypting...",
    success: "Complete",
  },
  es: {
    dashboardTitle: "Panel Nexus",
    storageUsed: "Uso",
    remainingCap: "Densidad",
    sessionType: "Protocolo",
    status: "Cifrado",
    searchPlaceholder: "Filtrar fragmentos...",
    injectImages: "Inyectar",
    bulkExport: "Exportar Nodo",
    activeNodes: "Nodos",
    selectionMode: "Selección",
    downloadSelected: "Exportar Selección",
    exportModalTitle: "Protocolo de Archivo",
    exportAll: "Exportación Total",
    exportSelected: "Exportación Parcial",
    compiling: "Compilando flujos...",
    cancel: "Abortar",
    emptyVault: "Nexus Inactivo",
    injectPrompt: "Sin fragmentos activos.",
    processing: "Hidratando",
    saving: "Cifrando...",
    success: "Completado",
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
          alert(`CRITICAL ERROR: File protocol limit is 50MB.`);
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
          alert(`INJECTION FAILED: Uplink refused.`);
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
      const folder = zip.folder(`${vault.username}_Secure_Archive`);
      
      for (let i = 0; i < targets.length; i++) {
        const img = targets[i];
        setZipStatus(`${t.processing}: ${img.name.slice(0, 10)}... (${i + 1}/${targets.length})`);
        
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
          console.error(`Asset hydration failed: ${img.name}`);
        }
      }

      if (successCount === 0) throw new Error('Hydration failure.');

      setZipStatus(t.saving);
      const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
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
    <div className="space-y-6 md:space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-[1600px] mx-auto px-2 md:px-0">
      
      {/* Precision HUD Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
        <HUDCard icon={<Database />} label={t.storageUsed} value={`${totalSize} MB`} />
        <HUDCard icon={<Activity />} label={t.remainingCap} value="∞ Capacity" pulse color="cyan" />
        <HUDCard icon={<Clock />} label={t.sessionType} value={vault.expiry === ExpiryOption.NEVER ? 'Never' : vault.expiry} />
        <HUDCard icon={<ShieldAlert />} label={t.status} value={vault.isViewOnly ? 'Read Only' : 'Active'} color="indigo" />
      </div>

      {/* Main Command Center Architecture */}
      <div className="glass-card p-5 md:p-12 rounded-[1.5rem] md:rounded-[4rem] relative overflow-hidden group border-white/5">
        <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-600/5 blur-[150px] pointer-events-none group-hover:bg-indigo-600/15 transition-all duration-1000"></div>
        
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 md:gap-12 relative z-10">
          <div className="space-y-2 md:space-y-4">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              <span className="text-[7px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.5em]">Node Uplink Established</span>
            </div>
            <h2 className="text-3xl md:text-6xl lg:text-8xl font-[1000] text-white italic tracking-tighter uppercase leading-[0.9] md:leading-[0.85] mb-1 md:mb-4 truncate">
              {vault.vaultName || t.dashboardTitle}
            </h2>
            <div className="flex flex-wrap items-center gap-2 md:gap-6">
               <div className="px-2 md:px-5 py-1 md:py-2 bg-slate-950/80 border border-white/10 rounded-lg md:rounded-2xl flex items-center gap-2 md:gap-3 max-w-full">
                  <Terminal className="w-3 md:w-4 h-3 md:h-4 text-indigo-400 shrink-0" />
                  <span className="text-[9px] md:text-sm font-mono text-white font-bold tracking-widest uppercase truncate">{vault.username}</span>
               </div>
               <span className="text-[7px] md:text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] md:tracking-[0.4em] italic">Cryptographic Node ID</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-6 items-stretch sm:items-center">
            <div className="relative group/search flex-1">
              <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-slate-700 group-focus-within/search:text-indigo-400 transition-colors" />
              <input 
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950/90 border border-slate-800 rounded-xl md:rounded-[2rem] pl-10 md:pl-16 pr-4 md:pr-10 py-3 md:py-5 text-xs md:text-base focus:outline-none focus:ring-1 focus:ring-indigo-500/50 w-full xl:w-[400px] text-white placeholder:text-slate-800 transition-all font-medium"
              />
            </div>

            <div className="flex gap-2 md:gap-4 h-12 md:h-auto">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex-1 px-4 md:px-12 py-3 md:py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl md:rounded-[2rem] font-[1000] italic uppercase tracking-[0.1em] md:tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 md:gap-4 group/inject"
              >
                {uploading ? <Loader2 className="w-4 md:w-6 h-4 md:h-6 animate-spin" /> : <Upload className="w-4 md:w-6 h-4 md:h-6 transition-transform" />}
                <span className="text-[10px] md:text-base">{t.injectImages}</span>
              </button>

              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-3 md:p-5 rounded-xl md:rounded-[1.5rem] border transition-all ${showSettings ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}
              >
                <Settings className="w-4 md:w-6 h-4 md:h-6" />
              </button>
            </div>

            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      {(uploadStatus || zipLoading) && (
        <div className="glass-card p-4 md:p-10 rounded-xl md:rounded-[3rem] border-indigo-500/30 animate-in slide-in-from-top-4 duration-700 shadow-2xl bg-indigo-950/5">
          <div className="flex justify-between items-center mb-3 md:mb-6">
            <div className="flex items-center gap-3 md:gap-5 min-w-0">
              <div className="p-2 md:p-3 bg-indigo-500/10 rounded-lg md:rounded-2xl shrink-0"><Command className="w-4 md:w-6 h-4 md:h-6 text-indigo-400 animate-spin-slow" /></div>
              <div className="min-w-0">
                <span className="text-xs md:text-lg font-black text-white italic tracking-tight uppercase block truncate">
                  {zipLoading ? zipStatus : `${uploadStatus?.fileName}`}
                </span>
                <span className="text-[6px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest">Protocol Handshake...</span>
              </div>
            </div>
            {uploadStatus && <span className="text-sm md:text-3xl font-mono font-black text-indigo-400 tracking-tighter ml-2">{uploadStatus.progress}%</span>}
          </div>
          <div className="w-full h-1 md:h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5 p-0.5">
            <div 
              className={`h-full bg-gradient-to-r from-indigo-700 via-indigo-500 to-cyan-400 transition-all duration-300 rounded-full ${zipLoading ? 'animate-pulse' : ''}`} 
              style={{ width: zipLoading ? '100%' : `${uploadStatus?.progress}%` }} 
            />
          </div>
        </div>
      )}

      {/* Stream Control Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-10 border-b border-white/5 pb-4 md:pb-10">
        <div className="flex items-center gap-4 md:gap-10">
          <h3 className="text-lg md:text-4xl font-[1000] text-white italic uppercase tracking-tighter flex items-center gap-2 md:gap-5">
            <Network className="w-5 md:w-8 h-5 md:h-8 text-indigo-500" />
            Shard Stream
          </h3>
          <button 
            onClick={() => { setSelectionMode(!selectionMode); setSelectedIds(new Set()); }}
            className={`px-3 md:px-8 py-1.5 md:py-2.5 rounded-full text-[7px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.3em] border transition-all flex items-center gap-1.5 md:gap-3 ${selectionMode ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
          >
            <ListFilter className="w-3 md:w-5 h-3 md:h-5" />
            {t.selectionMode}
          </button>
        </div>

        <div className="flex items-center gap-3 md:gap-8 w-full md:w-auto">
          {selectionMode && selectedIds.size > 0 && (
            <button 
              onClick={() => executeExport('selected')}
              className="flex-1 md:flex-none px-4 md:px-10 py-2 md:py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg md:rounded-2xl text-[8px] md:text-[11px] font-[1000] uppercase tracking-[0.1em] md:tracking-[0.3em] transition-all flex items-center justify-center gap-2 md:gap-4 shadow-xl active:scale-95"
            >
              Extract ({selectedIds.size})
            </button>
          )}
          <button 
            onClick={() => setShowExportModal(true)} 
            disabled={zipLoading || vault.images.length === 0} 
            className="flex-1 md:flex-none px-4 py-2 justify-center md:justify-start text-[8px] md:text-xs font-[1000] uppercase tracking-[0.2em] md:tracking-[0.4em] text-slate-600 hover:text-indigo-400 transition-all flex items-center gap-2 md:gap-4 group/exp active:scale-95 disabled:opacity-30"
          >
            <FileArchive className="w-3 md:w-5 h-3 md:h-5 transition-transform" /> 
            {t.bulkExport}
          </button>
        </div>
      </div>

      {/* Responsive Grid */}
      {filteredAssets.length === 0 ? (
        <div className="py-16 md:py-64 text-center glass-card rounded-[1.5rem] md:rounded-[5rem] border-dashed border-slate-800 bg-transparent group hover:border-indigo-500/20 transition-all duration-1000">
           <div className="p-5 md:p-10 bg-slate-900/40 rounded-xl md:rounded-[3rem] w-16 md:w-32 h-16 md:h-32 flex items-center justify-center mx-auto mb-4 md:mb-10 transition-transform group-hover:bg-indigo-950/30">
              <ImageIcon className="w-6 md:w-12 h-6 md:h-12 text-slate-800 group-hover:text-indigo-600" />
           </div>
           <h4 className="text-lg md:text-3xl font-[1000] text-slate-600 uppercase tracking-[0.3em] md:tracking-[0.6em] italic mb-1 md:mb-4">{t.emptyVault}</h4>
           <p className="text-slate-800 text-[7px] md:text-[11px] uppercase font-black tracking-[0.2em] md:tracking-[0.5em]">{t.injectPrompt}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-12">
          {filteredAssets.map((img) => (
            <div key={img.id} className="relative group/wrapper">
              {selectionMode && (
                <div 
                  className="absolute top-3 md:top-6 left-3 md:left-6 z-40 cursor-pointer animate-in zoom-in duration-500"
                  onClick={() => toggleSelection(img.id)}
                >
                  {selectedIds.has(img.id) ? (
                    <div className="bg-indigo-600 p-2 md:p-3 rounded-lg md:rounded-2xl border border-white/20 shadow-xl"><Check className="w-3 md:w-5 h-3 md:h-5 text-white" /></div>
                  ) : (
                    <div className="bg-slate-950/90 backdrop-blur-xl p-2 md:p-3 rounded-lg md:rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-all"><div className="w-3 md:w-5 h-3 md:h-5" /></div>
                  )}
                </div>
              )}
              <div className={`transition-all duration-700 ${selectionMode ? 'opacity-40 scale-90 grayscale pointer-events-none' : 'hover:scale-[1.02]'}`}>
                <ImageCard 
                  image={img} 
                  isViewOnly={vault.isViewOnly} 
                  onDelete={async () => {
                    if(!confirm('ANNIHILATE SHARD: Operation is irreversible.')) return;
                    const updated = vault.images.filter(i => i.id !== img.id);
                    const v = await StorageService.updateVaultImages(vault.id, updated);
                    onVaultUpdate(v);
                  }} 
                />
              </div>
              {selectionMode && (
                <div className="absolute inset-0 z-30 cursor-pointer" onClick={() => toggleSelection(img.id)} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-[15px] md:backdrop-blur-[40px] animate-in fade-in duration-700">
          <div className="glass-card w-full max-w-2xl p-6 md:p-20 rounded-[2rem] md:rounded-[5rem] border-white/5 relative text-center shadow-[0_0_200px_-50px_rgba(99,102,241,0.4)]">
            <button onClick={() => setShowExportModal(false)} className="absolute top-5 md:top-12 right-5 md:right-12 text-slate-600 hover:text-white transition-all"><X className="w-6 md:w-10 h-6 md:h-10" /></button>
            <div className="w-16 md:w-28 h-16 md:h-28 bg-indigo-600 rounded-xl md:rounded-[2.5rem] mx-auto flex items-center justify-center mb-6 md:mb-12 shadow-2xl">
              <FileArchive className="w-8 md:w-14 h-8 md:h-14 text-white" />
            </div>
            <h3 className="text-2xl md:text-6xl font-[1000] text-white italic uppercase tracking-tighter mb-3 md:mb-8 leading-none">{t.exportModalTitle}</h3>
            <p className="text-slate-500 mb-8 md:mb-16 italic leading-relaxed text-sm md:text-xl px-2">Compile distributed shard streams into localized binary ZIP archive.</p>
            
            <div className="grid grid-cols-1 gap-3 md:gap-8">
              <ExportOptionBtn onClick={() => executeExport('all')} label={t.exportAll} sub={`${vault.images.length} Objects Ready`} color="indigo" />
              <ExportOptionBtn onClick={() => { setShowExportModal(false); setSelectionMode(true); }} label={t.exportSelected} sub="Manual Stream Selection" color="slate" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HUDCard = ({ icon, label, value, color, pulse }: any) => {
  const isCyan = color === 'cyan';
  const isIndigo = color === 'indigo';

  return (
    <div className="glass-card p-3 md:p-10 rounded-xl md:rounded-[3rem] bg-slate-900/20 border border-white/5 group hover:border-indigo-500/20 transition-all flex flex-col justify-between min-h-[80px] md:min-h-[180px]">
      <div className="flex items-center gap-2 md:gap-5 mb-2 md:mb-6">
        <div className={`p-1.5 md:p-3 bg-slate-950 border border-white/5 rounded-lg md:rounded-2xl ${isCyan ? 'text-cyan-400' : isIndigo ? 'text-indigo-400' : 'text-slate-500'} ${pulse ? 'animate-pulse' : ''} group-hover:scale-110 transition-transform shrink-0`}>
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-3 md:w-6 h-3 md:h-6" }) : icon}
        </div>
        <span className="text-[6px] md:text-[11px] font-black text-slate-600 uppercase tracking-[0.1em] md:tracking-[0.4em] truncate">{label}</span>
      </div>
      <div className="text-sm md:text-4xl font-[1000] text-white italic tracking-tighter leading-none truncate">{value}</div>
    </div>
  );
};

const ExportOptionBtn = ({ onClick, label, sub, color }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-between p-4 md:p-10 rounded-xl md:rounded-[3rem] border transition-all group active:scale-95 ${color === 'indigo' ? 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 shadow-xl' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'}`}
  >
    <div className="text-left">
      <p className="text-sm md:text-2xl font-[1000] uppercase italic tracking-tighter leading-none mb-1 md:mb-2">{label}</p>
      <p className="text-[6px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] opacity-50 truncate max-w-[120px] md:max-w-none">{sub}</p>
    </div>
    <Download className={`w-4 md:w-8 h-4 md:h-8 ${color === 'indigo' ? 'text-white' : 'text-indigo-500'} group-hover:translate-y-1 transition-transform`} />
  </button>
);
