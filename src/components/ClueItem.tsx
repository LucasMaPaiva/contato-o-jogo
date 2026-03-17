import React from 'react';
import { motion } from 'motion/react';
import { Clue } from '../types/game';

type ClueItemProps = {
  clue: Clue;
  isMaster: boolean;
  playerName: string;
  contactWord: string;
  updateContactInput: (id: string, val: string) => void;
  onContact: (clueId: string, e: React.FormEvent) => void;
  onBlock: (clueId: string, e: React.FormEvent) => void;
};

export function ClueItem({ clue, isMaster, playerName, contactWord, updateContactInput, onContact, onBlock }: ClueItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`flex flex-col p-5 rounded-2xl border transition-all ${clue.status === 'contacted'
          ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20'
          : 'bg-[#141414] border-white/10'
        }`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded">
          {clue.player}
        </span>
        <div className="flex items-center gap-2">
          {clue.status === 'pending' && clue.pendingCountdown !== undefined && (
            <div className="text-[10px] font-bold text-yellow-500/70 bg-yellow-500/5 px-2 py-0.5 rounded border border-yellow-500/10">
              EXPIRA EM {clue.pendingCountdown}s
            </div>
          )}
          {clue.status === 'contacted' && (
            <div className="flex items-center gap-2 text-emerald-400 font-black text-xl">
              {clue.countdown}
            </div>
          )}
        </div>
      </div>
      <p className="text-lg font-medium leading-tight mb-4">{clue.text}</p>

      <div className="flex gap-2">
        {isMaster ? (
          clue.status === 'pending' ? (
            <form 
              onSubmit={(e) => onBlock(clue.id, e)}
              className="flex-1 flex gap-2"
            >
              <input
                type="text"
                value={contactWord}
                onChange={(e) => updateContactInput(clue.id, e.target.value)}
                placeholder="Adivinhe a palavra..."
                className="flex-1 min-w-0 bg-red-900/20 border border-red-500/30 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500/50"
              />
              <button 
                type="submit"
                className="bg-red-600/40 hover:bg-red-600/60 text-red-200 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg whitespace-nowrap"
              >
                QUEBRAR
              </button>
            </form>
          ) : (
            <div className="flex-1 text-center text-xs text-yellow-500/70 font-medium py-2">
               Tarde demais para quebrar! Contato em andamento.
            </div>
          )
        ) : (
          clue.status === 'pending' && clue.player !== playerName && (
            <form
              onSubmit={(e) => onContact(clue.id, e)}
              className="flex-1 flex gap-2"
            >
              <input
                type="text"
                value={contactWord}
                onChange={(e) => updateContactInput(clue.id, e.target.value)}
                placeholder="Qual palavra é?"
                className="flex-1 min-w-0 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500/50"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-900/20 whitespace-nowrap"
              >
                CONTATO!
              </button>
            </form>
          )
        )}
      </div>

      {clue.status === 'contacted' && (
        <p className="text-[10px] text-emerald-400 mt-3 font-medium text-center uppercase tracking-widest animate-pulse">
          Contato com {clue.contactPlayer}!
        </p>
      )}
    </motion.div>
  );
}
