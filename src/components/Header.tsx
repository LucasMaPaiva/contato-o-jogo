import React, { useState } from 'react';
import { Zap, Users, HelpCircle, RotateCcw, Copy, Check, LogOut } from 'lucide-react';

type HeaderProps = {
  playersCount: number;
  roomCode: string;
  resetVotesCount: number;
  requiredResetVotes: number;
  setShowRules: (show: boolean) => void;
  onOpenResetVote: () => void;
  onLeaveRoom: () => void;
};

export function Header({
  playersCount,
  roomCode,
  resetVotesCount,
  requiredResetVotes,
  setShowRules,
  onOpenResetVote,
  onLeaveRoom,
}: HeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <header className="border-bottom border-white/5 bg-[#0f0f0f]/80 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div className="flex items-center gap-3">
          <Zap className="text-emerald-400 w-5 h-5" />
          <div>
            <h1 className="font-bold tracking-tight text-lg">CONTATO</h1>
            <div className="flex items-center gap-2">
              <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-300/80">Sala {roomCode}</p>
              <button
                type="button"
                onClick={handleCopyRoomCode}
                className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300 transition hover:bg-emerald-500/20"
                title="Copiar codigo da sala"
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4 flex-wrap md:flex-nowrap">
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
            onClick={onOpenResetVote}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-300 transition-all hover:bg-white/10"
            title="Votar para reiniciar jogo"
          >
            <RotateCcw size={14} /> {resetVotesCount}/{requiredResetVotes}
          </button>
          <button
            onClick={onLeaveRoom}
            className="px-3 py-1.5 bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 rounded-full text-xs font-bold transition-all flex items-center gap-2"
            title="Sair da sala"
          >
            <LogOut size={14} /> SAIR
          </button>
        </div>
      </div>
    </header>
  );
}
