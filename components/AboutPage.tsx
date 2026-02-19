
import React, { useState, useEffect, isValidElement, cloneElement } from 'react';
import { 
  ArrowLeft, Instagram, Twitter, Youtube, Mail, Trophy, Cpu, Zap, 
  Brain, MessageSquare, ExternalLink, ShieldCheck, Globe, Code, 
  Fingerprint, Compass, Rocket, Star, Award, TrendingUp, Sparkles,
  Command, Hexagon, ChevronRight, Github, Layout as LayoutIcon, Cloud
} from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

const TypingHeader = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 50);
      return () => clearTimeout(timer);
    } else {
        const resetTimer = setTimeout(() => {
            setDisplayedText("");
            setIndex(0);
        }, 4000);
        return () => clearTimeout(resetTimer);
    }
  }, [index, text]);

  return (
    <span className="relative inline-block">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-cyan-400">
            {displayedText}
        </span>
        <span className="absolute -right-1 top-0 bottom-0 w-[2px] bg-indigo-500 animate-pulse" />
    </span>
  );
};

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  const executiveTeam = [
    {
      name: "Ravinder",
      role: "CEO",
      image: "https://raw.githubusercontent.com/GracerajPaul/Ravinder/main/IMG_20260216_194238_746.jpg",
      talent: "Strategic Scaling",
      description: "Mastermind of SnapSave's global operational footprint, focusing on high-velocity growth and institutional stability."
    },
    {
      name: "Ranjith",
      role: "Founder",
      image: "https://raw.githubusercontent.com/GracerajPaul/Ranjith/main/IMG_20260216_194245_808.jpg",
      talent: "Architectural Integrity",
      description: "Visionary responsible for the original cryptographic foundations and the 'Privacy by Default' core infrastructure."
    },
    {
      name: "Abhilash",
      role: "Co-Founder",
      image: "https://raw.githubusercontent.com/GracerajPaul/Abhilash/main/IMG_20260216_193601_604.jpg",
      talent: "Ecosystem Growth",
      description: "Driving force behind SnapSave's strategic partnerships and expansion into emerging digital privacy markets."
    }
  ];

  const coreTalents = [
    { icon: <Fingerprint className="w-5 h-5 md:w-6 md:h-6" />, title: "Ghost Protocol", desc: "Identity layers that leave zero footprint across the digital expanse." },
    { icon: <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />, title: "Quantum Defense", desc: "Future-proof encryption models that anticipate the evolution of compute." },
    { icon: <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />, title: "Agile Dominance", desc: "Iterating at the speed of thought while maintaining absolute silence." },
    { icon: <Command className="w-5 h-5 md:w-6 md:h-6" />, title: "Elite Command", desc: "A leadership structure built on meritocracy and technical excellence." }
  ];

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 px-2 md:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-16">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all group backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs md:text-sm font-bold tracking-tight uppercase">Return to Nexus</span>
        </button>
        <div className="flex gap-2 items-center px-3 py-1.5 bg-indigo-500/5 rounded-full border border-indigo-500/10">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-[8px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] md:tracking-[0.3em]">Operational Readiness</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="text-center mb-12 md:mb-28 space-y-4 md:space-y-6">
        <h2 className="text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-none italic uppercase">
          The <span className="text-transparent bg-clip-text bg-gradient-to-tr from-indigo-500 via-indigo-200 to-cyan-500">Elite</span> Guard
        </h2>
        <p className="text-slate-500 text-sm sm:text-lg md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed italic px-4">
          Forging the future of digital sovereignty through uncompromising privacy.
        </p>
      </div>

      {/* CHAIRMAN SPOTLIGHT */}
      <div className="relative mb-16 md:mb-40 group">
        <div className="absolute -top-10 -left-10 md:-top-20 md:-left-20 w-48 md:w-96 h-48 md:h-96 bg-indigo-600/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 md:-bottom-20 md:-right-20 w-48 md:w-96 h-48 md:h-96 bg-cyan-600/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
        
        <div className="relative glass-card rounded-[2rem] md:rounded-[4rem] overflow-hidden border border-slate-700/40 bg-slate-950/90 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-0 md:min-h-[700px]">
            <div className="lg:col-span-5 relative overflow-hidden bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800/50 aspect-square lg:aspect-auto">
                {/* Updated Chairman Image with optimized containment/positioning */}
                <img 
                    src="https://raw.githubusercontent.com/GracerajPaul/Profile/main/IMG_20260219_110928.png" 
                    alt="Chairman Graceraj Paul" 
                    className="absolute inset-0 w-full h-full object-cover object-center md:object-top transition-all duration-[3000ms] group-hover:scale-105 group-hover:contrast-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-transparent hidden lg:block" />
            </div>

            <div className="lg:col-span-7 p-6 md:p-16 lg:p-24 flex flex-col justify-center space-y-8 md:space-y-12 relative">
                <div className="relative z-10 space-y-4 md:space-y-6">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                        <Hexagon className="w-4 h-4 text-indigo-500 animate-spin-slow" />
                        <span className="text-[9px] md:text-[12px] font-black text-white uppercase tracking-[0.3em] md:tracking-[0.5em]">Chairman Graceraj Paul</span>
                    </div>
                    <h3 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[0.9] md:leading-[0.8] tracking-tighter uppercase italic">
                        Strategic <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-white to-cyan-400">Vision</span>
                    </h3>
                </div>
                <div className="relative z-10 h-8 md:h-10 text-base sm:text-2xl md:text-4xl font-mono font-bold tracking-tight">
                    <TypingHeader text="Silence is Power. Privacy is Sovereign." />
                </div>
                <div className="relative z-10 space-y-8 md:space-y-10">
                    <p className="text-sm sm:text-lg md:text-2xl text-slate-400 font-light leading-relaxed max-w-2xl italic">
                      The architect of the SnapSave doctrine. Graceraj combines <span className="text-white font-bold">Stoic Philosophy</span> with <span className="text-white font-bold">Cutting-Edge Strategy</span> to ensure anonymity remains an absolute human right.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                        {[
                            { label: 'Philosophy', val: 'Digital Stoicism', icon: <Brain className="w-4 h-4 md:w-5 md:h-5" /> },
                            { label: 'Command', val: 'Direct Strategic', icon: <Command className="w-4 h-4 md:w-5 md:h-5" /> },
                            { label: 'Network', val: 'Global Anonymity', icon: <Globe className="w-4 h-4 md:w-5 md:h-5" /> },
                            { label: 'Status', val: 'Primary Vanguard', icon: <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" /> }
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-4 md:gap-5 group/stat">
                                <div className="p-3 md:p-4 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl transition-all text-indigo-400 group-hover/stat:bg-indigo-600 group-hover/stat:text-white group-hover/stat:scale-110">
                                    {stat.icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[7px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5 truncate">{stat.label}</p>
                                    <p className="text-xs md:text-lg font-black text-white italic truncate">{stat.val}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 md:gap-8 pt-6 md:pt-10">
                        <a href="mailto:gracerajpaul1@gmail.com" className="group/btn relative px-8 py-4 md:px-12 md:py-6 bg-indigo-600 rounded-xl md:rounded-[2rem] overflow-hidden transition-all text-center shadow-lg shadow-indigo-600/20 active:scale-95">
                            <span className="relative flex items-center justify-center gap-3 text-white font-black text-xs md:text-sm uppercase tracking-widest">
                                <Mail className="w-4 h-4 md:w-5 h-5" /> Establish Contact
                            </span>
                        </a>
                        <div className="flex justify-center gap-3">
                            {[
                                { icon: <Instagram />, url: "https://instagram.com/gracerajpaul" },
                                { icon: <Twitter />, url: "https://x.com/gracerajpaul" },
                                { icon: <Youtube />, url: "https://youtube.com/@gracerajpaul" }
                            ].map((soc, i) => (
                                <a key={i} href={soc.url} target="_blank" className="p-4 md:p-6 bg-white/5 border border-white/10 rounded-xl md:rounded-[1.5rem] text-white transition-all hover:-translate-y-1 hover:bg-indigo-600/10">
                                    {isValidElement(soc.icon) ? cloneElement(soc.icon as React.ReactElement<any>, { className: "w-5 h-5 md:w-6 h-6" }) : soc.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* THE EXECUTIVE UNIT */}
      <div className="mb-16 md:mb-40">
        <div className="flex items-center gap-4 md:gap-10 mb-8 md:mb-20 px-2 md:px-0">
          <h4 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase">The <span className="text-indigo-500">Execution</span> Unit</h4>
          <div className="h-[1px] md:h-[2px] flex-1 bg-gradient-to-r from-indigo-500/40 to-transparent"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {executiveTeam.map((member, i) => (
            <div key={member.name} className="group relative">
                <div className="relative glass-card p-4 md:p-6 rounded-[2rem] md:rounded-[4rem] border border-white/5 bg-slate-950/40 overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:border-indigo-500/20">
                    <div className="relative overflow-hidden rounded-[1.5rem] md:rounded-[3rem] aspect-square md:aspect-[4/5] mb-6 md:mb-10">
                        <img 
                            src={member.image} 
                            alt={member.name} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-95" />
                        <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10">
                            <h5 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter leading-none italic uppercase">{member.name}</h5>
                            <p className="text-indigo-500 text-[9px] md:text-[12px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] mt-1 md:mt-3">{member.role}</p>
                        </div>
                    </div>
                    <div className="px-2 md:px-6 pb-6 md:pb-10 space-y-4 md:space-y-6">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-8 md:w-12 h-[1px] md:h-[2px] bg-indigo-500" />
                            <span className="text-[9px] md:text-[11px] font-black text-white/90 uppercase tracking-[0.1em] md:tracking-[0.2em] italic">{member.talent}</span>
                        </div>
                        <p className="text-slate-400 text-xs sm:text-sm md:text-lg leading-relaxed font-medium italic">
                            {member.description}
                        </p>
                    </div>
                </div>
            </div>
          ))}
        </div>
      </div>

      {/* CORE TALENTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 mb-16 md:mb-40">
        {coreTalents.map((t, i) => (
          <div key={i} className="p-8 md:p-14 bg-slate-950/50 border border-slate-800/40 rounded-[2rem] md:rounded-[4rem] border-b-[4px] md:border-b-[8px] border-b-indigo-500/20 hover:border-b-indigo-500 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] rounded-full -mr-16 -mt-16" />
            <div className="w-12 h-12 md:w-20 md:h-20 bg-white/5 rounded-xl md:rounded-[2rem] flex items-center justify-center text-indigo-400 mb-6 md:mb-10 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 transition-all duration-500">
              {isValidElement(t.icon) ? cloneElement(t.icon as React.ReactElement<any>, { className: "w-6 h-6 md:w-8 md:h-8" }) : t.icon}
            </div>
            <h5 className="text-xl md:text-3xl font-black text-white mb-3 md:mb-6 tracking-tight uppercase italic">{t.title}</h5>
            <p className="text-slate-500 text-xs sm:text-sm md:text-lg leading-relaxed font-medium italic">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* VISIONARY STATEMENT */}
      <div className="relative py-20 md:py-48 rounded-[2.5rem] md:rounded-[6rem] overflow-hidden bg-slate-950 border border-slate-800/50 mb-10 shadow-2xl">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#6366f1 1.5px, transparent 1.5px), linear-gradient(90deg, #6366f1 1.5px, transparent 1.5px)', backgroundSize: '60px 60px' }} />
        <div className="relative z-10 text-center space-y-8 md:space-y-16 px-6">
            <div className="inline-block p-4 md:p-6 bg-indigo-600/10 rounded-full border border-indigo-500/20 shadow-xl shadow-indigo-600/5">
                <Command className="w-8 h-8 md:w-14 md:h-14 text-indigo-500" />
            </div>
            <h4 className="text-2xl sm:text-4xl md:text-6xl lg:text-8xl font-black text-white italic max-w-6xl mx-auto leading-[1.1] md:leading-[1.0] tracking-tighter uppercase px-4">
                "The strongest steel is forged in the silent fire of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">discipline</span>."
            </h4>
            <div className="space-y-4">
                <p className="text-slate-500 font-black uppercase tracking-[0.4em] md:tracking-[0.8em] text-[8px] md:text-[12px]">SnapSave Engineering Doctrine</p>
                <div className="w-24 md:w-48 h-[1px] md:h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto rounded-full" />
            </div>
        </div>
      </div>
    </div>
  );
};
