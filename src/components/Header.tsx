import React from 'react';
import { Zap, Users, HelpCircle, RotateCcw } from 'lucide-react';

type HeaderProps = {
  playersCount: number;
  setShowRules: (show: boolean) => void;
  onReset: () => void;
};

export function Header({ playersCount, setShowRules, onReset }: HeaderProps) {
  return (
    <header className="border-bottom border-white/5 bg-[#0f0f0f]/80 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Zap className="text-emerald-400 w-5 h-5" />
          <h1 className="font-bold tracking-tight text-lg">CONTATO</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <Users size={16} className="text-gray-400" />
            <span className="text-sm font-medium">{playersCount}</span>
          </div>
          <button
            onClick={() => setShowRules(true)}
            className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 rounded-full text-xs font-bold transition-all flex items-center gap-2"
            title="Como Jogar"
          >
             <HelpCircle size={14} /> REGRAS
          </button>
          <button
            onClick={onReset}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400"
            title="Reiniciar Jogo"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
