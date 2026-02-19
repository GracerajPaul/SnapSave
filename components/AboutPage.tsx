
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
    { icon: <Fingerprint className="w-6 h-6" />, title: "Ghost Protocol", desc: "Identity layers that leave zero footprint across the digital expanse." },
    { icon: <ShieldCheck className="w-6 h-6" />, title: "Quantum Defense", desc: "Future-proof encryption models that anticipate the evolution of compute." },
    { icon: <TrendingUp className="w-6 h-6" />, title: "Agile Dominance", desc: "Iterating at the speed of thought while maintaining absolute silence." },
    { icon: <Command className="w-6 h-6" />, title: "Elite Command", desc: "A leadership structure built on meritocracy and technical excellence." }
  ];

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex justify-between items-center mb-16">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all group backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold tracking-tight">Return to Nexus</span>
        </button>
        <div className="flex gap-3 items-center px-4 py-2 bg-indigo-500/5 rounded-full border border-indigo-500/10">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Operational Readiness</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="text-center mb-28 space-y-6">
        <h2 className="text-6xl sm:text-9xl font-black text-white tracking-tighter leading-none italic uppercase">
          The <span className="text-transparent bg-clip-text bg-gradient-to-tr from-indigo-500 via-indigo-200 to-cyan-500">Elite</span> Guard
        </h2>
        <p className="text-slate-500 text-lg sm:text-2xl max-w-3xl mx-auto font-medium leading-relaxed italic">
          Forging the future of digital sovereignty through uncompromising privacy.
        </p>
      </div>

      {/* HIGH-END MIXED CHAIRMAN SPOTLIGHT */}
      <div className="relative mb-40 group">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative glass-card rounded-[5rem] overflow-hidden border border-slate-700/40 bg-slate-950/90 shadow-[0_0_80px_-20px_rgba(79,70,229,0.4)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[700px]">
            <div className="lg:col-span-5 relative overflow-hidden bg-slate-900 border-r border-slate-800/50">
                <img 
                    src="https://raw.githubusercontent.com/GracerajPaul/Profile/main/IMG_20250428_203419_504.jpg" 
                    alt="Graceraj Paul" 
                    className="absolute inset-0 w-full h-full object-cover object-top grayscale contrast-125 transition-all duration-[3000ms] group-hover:scale-105 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/20 via-transparent to-transparent lg:block hidden" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute bottom-12 left-12 p-8 glass-card rounded-[3rem] border border-white/10 backdrop-blur-2xl max-w-[280px] hidden sm:block">
                    <div className="flex gap-1.5 mb-4">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-indigo-500 text-indigo-500" />)}
                    </div>
                    <p className="text-sm text-white/90 font-bold italic leading-relaxed">
                      "Privacy is the silent bedrock upon which all true freedom is built."
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-8 h-[2px] bg-indigo-500" />
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Core Directive</span>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-7 p-10 lg:p-24 flex flex-col justify-center space-y-12 relative">
                <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none">
                    <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#6366f1 1.5px, transparent 1.5px), linear-gradient(90deg, #6366f1 1.5px, transparent 1.5px)', backgroundSize: '60px 60px' }} />
                </div>
                <div className="relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-4 px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                        <Hexagon className="w-5 h-5 text-indigo-500 animate-spin-slow" />
                        <span className="text-[12px] font-black text-white uppercase tracking-[0.5em]">Chairman Graceraj Paul</span>
                    </div>
                    <h3 className="text-7xl sm:text-9xl font-black text-white leading-[0.8] tracking-tighter uppercase italic">
                        Strategic <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-white to-cyan-400">Vision</span>
                    </h3>
                </div>
                <div className="relative z-10 h-10 text-2xl sm:text-4xl font-mono font-bold tracking-tight">
                    <TypingHeader text="Silence is Power. Privacy is Sovereign." />
                </div>
                <div className="relative z-10 space-y-10">
                    <p className="text-xl sm:text-2xl text-slate-400 font-light leading-relaxed max-w-2xl italic">
                      The architect of the SnapSave doctrine. Graceraj combines <span className="text-white font-bold">Stoic Philosophy</span> with <span className="text-white font-bold">Cutting-Edge Strategy</span> to lead an organization where the user's right to anonymity is the absolute priority.
                    </p>
                    <div className="grid grid-cols-2 gap-8">
                        {[
                            { label: 'Philosophy', val: 'Digital Stoicism', icon: <Brain className="w-5 h-5" /> },
                            { label: 'Command', val: 'Direct Strategic', icon: <Command className="w-5 h-5" /> },
                            { label: 'Network', val: 'Global Anonymity', icon: <Globe className="w-5 h-5" /> },
                            { label: 'Status', val: 'Primary Vanguard', icon: <ShieldCheck className="w-5 h-5" /> }
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-5 group/stat">
                                <div className="p-4 bg-white/5 border border-white/10 rounded-3xl group-hover/stat:bg-indigo-600 transition-all text-indigo-400 group-hover/stat:text-white group-hover/stat:scale-110 shadow-lg">
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className="text-lg font-black text-white italic">{stat.val}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-8 pt-10">
                        <a href="mailto:gracerajpaul1@gmail.com" className="group/btn relative px-12 py-6 bg-indigo-600 rounded-[2rem] overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/40">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                            <span className="relative flex items-center gap-4 text-white font-black text-sm uppercase tracking-widest">
                                <Mail className="w-5 h-5" /> Establish Contact
                            </span>
                        </a>
                        <div className="flex gap-4">
                            {[
                                { icon: <Instagram />, url: "https://instagram.com/gracerajpaul", color: "hover:bg-pink-600 shadow-pink-500/20" },
                                { icon: <Twitter />, url: "https://x.com/gracerajpaul", color: "hover:bg-blue-400 shadow-blue-400/20" },
                                { icon: <Youtube />, url: "https://youtube.com/@gracerajpaul", color: "hover:bg-red-600 shadow-red-600/20" }
                            ].map((soc, i) => (
                                <a key={i} href={soc.url} target="_blank" className={`p-6 bg-white/5 border border-white/10 rounded-[1.5rem] text-white transition-all hover:-translate-y-2 hover:shadow-xl ${soc.color}`}>
                                    {isValidElement(soc.icon) ? cloneElement(soc.icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" }) : soc.icon}
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
      <div className="mb-40">
        <div className="flex items-center gap-10 mb-20">
          <h4 className="text-5xl font-black text-white tracking-tighter italic uppercase">The <span className="text-indigo-500">Execution</span> Unit</h4>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-indigo-500/40 to-transparent"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {executiveTeam.map((member, i) => (
            <div key={member.name} className="group relative">
                <div className="absolute -top-16 -left-8 text-[12rem] font-black text-white/[0.02] pointer-events-none select-none italic tracking-tighter">
                    {i+1}
                </div>
                <div className="relative glass-card p-6 rounded-[4rem] border border-white/5 hover:border-indigo-500/40 transition-all duration-700 hover:-translate-y-4 bg-slate-950/40 group-hover:shadow-[0_30px_70px_-20px_rgba(79,70,229,0.3)] overflow-hidden">
                    <div className="relative overflow-hidden rounded-[3rem] aspect-[4/5] mb-10">
                        <img 
                            src={member.image} 
                            alt={member.name} 
                            className="w-full h-full object-cover transition-all duration-1000 grayscale group-hover:grayscale-0 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-95" />
                        <div className="absolute bottom-10 left-10">
                            <h5 className="text-5xl font-black text-white tracking-tighter leading-none italic uppercase">{member.name}</h5>
                            <p className="text-indigo-500 text-[12px] font-black uppercase tracking-[0.4em] mt-3">{member.role}</p>
                        </div>
                    </div>
                    <div className="px-6 pb-10 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-[2px] bg-indigo-500" />
                            <span className="text-[11px] font-black text-white/90 uppercase tracking-[0.2em] italic">{member.talent}</span>
                        </div>
                        <p className="text-slate-400 text-lg leading-relaxed font-medium italic">
                            {member.description}
                        </p>
                    </div>
                </div>
            </div>
          ))}
        </div>
      </div>

      {/* CORE TALENTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-40">
        {coreTalents.map((t, i) => (
          <div key={i} className="p-14 bg-slate-950/50 border border-slate-800/40 rounded-[4rem] hover:bg-slate-900 transition-all group border-b-[8px] hover:border-b-indigo-500 relative overflow-hidden shadow-2xl">
            <div className="absolute -top-10 -right-10 p-20 opacity-[0.02] text-white pointer-events-none">
                {isValidElement(t.icon) ? cloneElement(t.icon as React.ReactElement<{ className?: string }>, { className: "w-8 h-8" }) : t.icon}
            </div>
            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-indigo-400 mb-10 group-hover:scale-110 group-hover:text-white group-hover:bg-indigo-600 transition-all shadow-2xl">
              {isValidElement(t.icon) ? cloneElement(t.icon as React.ReactElement<{ className?: string }>, { className: "w-8 h-8" }) : t.icon}
            </div>
            <h5 className="text-3xl font-black text-white mb-6 tracking-tight uppercase italic">{t.title}</h5>
            <p className="text-slate-500 text-lg leading-relaxed font-medium italic">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* FINAL VISIONARY STATEMENT */}
      <div className="relative py-48 rounded-[6rem] overflow-hidden bg-slate-950 border border-slate-800/50 mb-20 shadow-[0_0_100px_-20px_rgba(79,70,229,0.2)]">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(to right, #4f46e5 1px, transparent 1px), linear-gradient(to bottom, #4f46e5 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        <div className="relative z-10 text-center space-y-16">
            <div className="inline-block p-6 bg-indigo-600/10 rounded-full animate-pulse border border-indigo-500/20 shadow-2xl">
                <Command className="w-12 h-12 text-indigo-500" />
            </div>
            <h4 className="text-5xl sm:text-8xl font-black text-white italic max-w-6xl mx-auto leading-[1.0] tracking-tighter px-8 uppercase">
                "The strongest steel is forged in the silent fire of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">discipline</span>."
            </h4>
            <div className="space-y-6">
                <p className="text-slate-500 font-black uppercase tracking-[0.8em] text-[12px]">SnapSave Engineering Doctrine</p>
                <div className="w-48 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto rounded-full" />
            </div>
        </div>
      </div>
      <div className="h-24" />
    </div>
  );
};
