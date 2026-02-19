
import React, { useState, useRef, useMemo } from 'react';
import { 
  Upload, Download, Trash2, Settings, Check, 
  FileArchive, Loader2, Search, Database, Clock, 
  ShieldAlert, Image as ImageIcon, HardDrive, Network,
  Languages, CheckSquare, X, ListFilter, Command, Activity, Terminal
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
    dashboardTitle: "Nexus Operational Dashboard",
    storageUsed: "Usage Statistics",
    remainingCap: "Node Density",
    sessionType: "Class Protocol",
    status: "Encryption Status",
    searchPlaceholder: "Filter shard stream...",
    injectImages: "Inject Assets",
    bulkExport: "Full Node Archive",
    activeNodes: "Nodes",
    selectionMode: "Manual Selection",
    downloadSelected: "Archive Selection",
    exportModalTitle: "Archival Protocol",
    exportAll: "Full Stream Export",
    exportSelected: "Segmented Export",
    compiling: "Compiling binary streams...",
    cancel: "Abort Handshake",
    emptyVault: "Nexus Idle",
    injectPrompt: "No active assets detected in this node.",
    processing: "Hydrating Shard",
    saving: "Encrypting Archive...",
    success: "Protocol Handshake Complete",
  },
  es: {
    dashboardTitle: "Panel Operativo Nexus",
    storageUsed: "Estadísticas de Uso",
    remainingCap: "Densidad de Nodo",
    sessionType: "Protocolo de Clase",
    status: "Estado de Cifrado",
    searchPlaceholder: "Filtrar flujo de fragmentos...",
    injectImages: "Inyectar Activos",
    bulkExport: "Archivo Completo de Nodo",
    activeNodes: "Nodos",
    selectionMode: "Selección Manual",
    downloadSelected: "Selección de Archivo",
    exportModalTitle: "Protocolo de Archivo",
    exportAll: "Exportación de Flujo Completo",
    exportSelected: "Exportación Segmentada",
    compiling: "Compilando flujos binarios...",
    cancel: "Abortar Protocolo",
    emptyVault: "Nexus Inactivo",
    injectPrompt: "No se detectaron activos en este nodo.",
    processing: "Hidratando fragmento",
    saving: "Cifrando archivo...",
    success: "Protocolo completado",
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
          alert(`INJECTION FAILED: Cloud uplink refused.`);
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
        setZipStatus(`${t.processing}: ${img.name.slice(0, 15)}... (${i + 1}/${targets.length})`);
        
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

      if (successCount === 0) throw new Error('Data stream hydration failure.');

      setZipStatus(t.saving);
      const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SnapSave_${vault.username}_Archive_${Date.now()}.zip`;
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
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-[1600px] mx-auto">
      
      {/* Precision HUD Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        <HUDCard icon={<Database />} label={t.storageUsed} value={`${totalSize} MB`} />
        <HUDCard icon={<Activity />} label={t.remainingCap} value="∞ Capacity" pulse color="cyan" />
        <HUDCard icon={<Clock />} label={t.sessionType} value={vault.expiry === ExpiryOption.NEVER ? 'Persistent' : 'Ephemeral'} />
        <HUDCard icon={<ShieldAlert />} label={t.status} value={vault.isViewOnly ? 'Read Only' : 'Active Encryption'} color="indigo" />
      </div>

      {/* Main Command Center Architecture */}
      <div className="glass-card p-12 rounded-[4rem] relative overflow-hidden group border-white/5">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[150px] pointer-events-none group-hover:bg-indigo-600/15 transition-all duration-1000"></div>
        
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em]">Node Uplink: Standard_Handshake</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-[1000] text-white italic tracking-tighter uppercase leading-[0.85] mb-4">
              {vault.vaultName || t.dashboardTitle}
            </h2>
            <div className="flex flex-wrap items-center gap-6">
               <div className="px-5 py-2 bg-slate-950/80 border border-white/10 rounded-2xl flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-mono text-white font-bold tracking-widest uppercase">{vault.username}</span>
               </div>
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic">Authorized Cryptographic Node</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 items-center">
            <div className="relative group/search">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within/search:text-indigo-400 transition-colors" />
              <input 
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950/90 border border-slate-800 rounded-[2rem] pl-16 pr-10 py-5 text-base focus:outline-none focus:ring-1 focus:ring-indigo-500/50 w-full sm:w-[400px] text-white placeholder:text-slate-800 transition-all font-medium"
              />
            </div>

            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-[1000] italic uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-4 group/inject"
            >
              {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6 group-hover/inject:translate-y-[-2px] transition-transform" />}
              {t.injectImages}
            </button>

            <div className="flex gap-4">
              <button 
                onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
                className="p-5 bg-slate-900/60 border border-slate-800 rounded-[1.5rem] text-slate-400 hover:text-white transition-all hover:bg-slate-800"
              >
                <Languages className="w-6 h-6" />
              </button>

              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-5 rounded-[1.5rem] border transition-all ${showSettings ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl shadow-indigo-600/40' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'}`}
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>

            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          </div>
        </div>
      </div>

      {/* Dynamic Processing Overlay */}
      {(uploadStatus || zipLoading) && (
        <div className="glass-card p-10 rounded-[3rem] border-indigo-500/30 animate-in slide-in-from-top-4 duration-700 shadow-2xl bg-indigo-950/5">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-indigo-500/10 rounded-2xl"><Command className="w-6 h-6 text-indigo-400 animate-spin-slow" /></div>
              <div>
                <span className="text-lg font-black text-white italic tracking-tight uppercase block">
                  {zipLoading ? zipStatus : `${uploadStatus?.fileName}`}
                </span>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Protocol in progress...</span>
              </div>
            </div>
            {uploadStatus && <span className="text-3xl font-mono font-black text-indigo-400 tracking-tighter">{uploadStatus.progress}%</span>}
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5 p-0.5">
            <div 
              className={`h-full bg-gradient-to-r from-indigo-700 via-indigo-500 to-cyan-400 transition-all duration-300 rounded-full ${zipLoading ? 'animate-pulse' : ''}`} 
              style={{ width: zipLoading ? '100%' : `${uploadStatus?.progress}%` }} 
            />
          </div>
        </div>
      )}

      {/* Stream Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-10 border-b border-white/5 pb-10">
        <div className="flex items-center gap-10">
          <h3 className="text-4xl font-[1000] text-white italic uppercase tracking-tighter flex items-center gap-5">
            <Network className="w-8 h-8 text-indigo-500" />
            Shard Stream
          </h3>
          <button 
            onClick={() => { setSelectionMode(!selectionMode); setSelectedIds(new Set()); }}
            className={`px-8 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] border transition-all flex items-center gap-3 ${selectionMode ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-600/30' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800'}`}
          >
            <ListFilter className="w-5 h-5" />
            {t.selectionMode}
          </button>
        </div>

        <div className="flex items-center gap-8">
          {selectionMode && selectedIds.size > 0 && (
            <button 
              onClick={() => executeExport('selected')}
              className="px-10 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[11px] font-[1000] uppercase tracking-[0.3em] transition-all flex items-center gap-4 shadow-2xl shadow-emerald-600/20 active:scale-95"
            >
              Extract Segment ({selectedIds.size})
            </button>
          )}
          <button 
            onClick={() => setShowExportModal(true)} 
            disabled={zipLoading || vault.images.length === 0} 
            className="text-sm font-[1000] uppercase tracking-[0.4em] text-slate-600 hover:text-indigo-400 transition-all flex items-center gap-4 group/exp active:scale-95"
          >
            <FileArchive className="w-5 h-5 group-hover/exp:scale-125 transition-transform" /> {t.bulkExport}
          </button>
        </div>
      </div>

      {/* Grid Architecture */}
      {filteredAssets.length === 0 ? (
        <div className="py-64 text-center glass-card rounded-[5rem] border-dashed border-slate-800 bg-transparent group hover:border-indigo-500/20 transition-all duration-1000">
           <div className="p-10 bg-slate-900/40 rounded-[3rem] w-32 h-32 flex items-center justify-center mx-auto mb-10 group-hover:scale-110 transition-transform group-hover:bg-indigo-950/30">
              <ImageIcon className="w-12 h-12 text-slate-800 group-hover:text-indigo-600 transition-colors" />
           </div>
           <h4 className="text-slate-600 font-[1000] uppercase tracking-[0.6em] italic text-3xl mb-4">{t.emptyVault}</h4>
           <p className="text-slate-800 text-[11px] uppercase font-black tracking-[0.5em]">{t.injectPrompt}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {filteredAssets.map((img) => (
            <div key={img.id} className="relative group/wrapper">
              {selectionMode && (
                <div 
                  className="absolute top-6 left-6 z-40 cursor-pointer animate-in zoom-in duration-500"
                  onClick={() => toggleSelection(img.id)}
                >
                  {selectedIds.has(img.id) ? (
                    <div className="bg-indigo-600 p-3 rounded-2xl border border-white/20 shadow-[0_0_40px_-5px_rgba(79,70,229,0.8)]"><Check className="w-5 h-5 text-white" /></div>
                  ) : (
                    <div className="bg-slate-950/90 backdrop-blur-xl p-3 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-all"><div className="w-5 h-5" /></div>
                  )}
                </div>
              )}
              <div className={`transition-all duration-700 ${selectionMode ? 'opacity-40 scale-90 grayscale pointer-events-none' : 'hover:scale-[1.02]'}`}>
                <ImageCard 
                  image={img} 
                  isViewOnly={vault.isViewOnly} 
                  onDelete={async () => {
                    if(!confirm('ANNIHILATE SHARD: This operation is irreversible.')) return;
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

      {/* High-Impact Archival Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-slate-950/98 backdrop-blur-[40px] animate-in fade-in duration-700">
          <div className="glass-card w-full max-w-2xl p-20 rounded-[5rem] border-white/5 relative text-center shadow-[0_0_200px_-50px_rgba(99,102,241,0.4)]">
            <button onClick={() => setShowExportModal(false)} className="absolute top-12 right-12 text-slate-600 hover:text-white transition-all"><X className="w-10 h-10" /></button>
            <div className="w-28 h-28 bg-indigo-600 rounded-[2.5rem] mx-auto flex items-center justify-center mb-12 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.5)]">
              <FileArchive className="w-14 h-14 text-white" />
            </div>
            <h3 className="text-6xl font-[1000] text-white italic uppercase tracking-tighter mb-8 leading-none">{t.exportModalTitle}</h3>
            <p className="text-slate-500 mb-16 italic leading-relaxed text-xl px-4">Compile all distributed shard streams into a single localized binary ZIP archive.</p>
            
            <div className="grid grid-cols-1 gap-8">
              <ExportOptionBtn onClick={() => executeExport('all')} label={t.exportAll} sub={`${vault.images.length} Objects Ready for extraction`} color="indigo" />
              <ExportOptionBtn onClick={() => { setShowExportModal(false); setSelectionMode(true); }} label={t.exportSelected} sub="Target Segment Selection" color="slate" />
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
    <div className="glass-card p-10 rounded-[3rem] bg-slate-900/20 border border-white/5 group hover:border-indigo-500/20 transition-all">
      <div className="flex items-center gap-5 mb-6">
        <div className={`p-3 bg-slate-950 border border-white/5 rounded-2xl ${isCyan ? 'text-cyan-400' : isIndigo ? 'text-indigo-400' : 'text-slate-500'} ${pulse ? 'animate-pulse' : ''} group-hover:scale-110 transition-transform group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]`}>
          {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
        </div>
        <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em]">{label}</span>
      </div>
      <div className="text-4xl font-[1000] text-white italic tracking-tighter leading-none">{value}</div>
    </div>
  );
};

const ExportOptionBtn = ({ onClick, label, sub, color }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-between p-10 rounded-[3rem] border transition-all group active:scale-95 ${color === 'indigo' ? 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 shadow-[0_20px_50px_-15px_rgba(79,70,229,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'}`}
  >
    <div className="text-left">
      <p className="text-2xl font-[1000] uppercase italic tracking-tighter leading-none mb-2">{label}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">{sub}</p>
    </div>
    <Download className={`w-8 h-8 ${color === 'indigo' ? 'text-white' : 'text-indigo-500'} group-hover:translate-y-2 transition-transform duration-500`} />
  </button>
);
