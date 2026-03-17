import React from 'react';
import { Shield, User } from 'lucide-react';
import { Player } from '../types/game';

type MasterPanelProps = {
  master: string | null;
  masterName: string;
  isMaster: boolean;
  hasWord: boolean;
  players: Player[];
  myId: string;
  becomeMaster: () => void;
  wordInput: string;
  setWordInput: (v: string) => void;
  setWord: (e: React.FormEvent) => void;
};

export function MasterPanel({ 
  master, masterName, isMaster, hasWord, players, myId, 
  becomeMaster, wordInput, setWordInput, setWord 
}: MasterPanelProps) {
  return (
    <div className="space-y-6">
      <section className="bg-[#141414] border border-white/10 rounded-2xl p-6">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Shield size={14} /> O Mestre
        </h2>
        {master ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
              <User size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="font-bold">{masterName}</p>
              <p className="text-xs text-gray-400">{isMaster ? 'Você é o mestre' : 'Está pensando na palavra'}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm mb-4">Ninguém é o mestre ainda.</p>
            <button
              onClick={becomeMaster}
              className="w-full bg-white text-black font-bold py-2 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Ser o Mestre
            </button>
          </div>
        )}
      </section>

      {isMaster && !hasWord && (
        <section className="bg-emerald-600/10 border border-emerald-500/20 rounded-2xl p-6">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">Defina a Palavra</h2>
          <form onSubmit={setWord} className="space-y-3">
            <input
              type="text"
              value={wordInput}
              onChange={(e) => setWordInput(e.target.value)}
              placeholder="Ex: AMIZADE"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500/50"
            />
            <button type="submit" className="w-full bg-emerald-600 py-2 rounded-xl font-bold">Começar Jogo</button>
          </form>
        </section>
      )}

      <section className="bg-[#141414] border border-white/10 rounded-2xl p-6">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Jogadores</h2>
        <div className="space-y-2">
          {players.map(p => (
            <div key={p.id} className="flex items-center justify-between text-sm py-1 border-b border-white/5 last:border-0">
              <span className={p.id === myId ? 'text-emerald-400 font-medium' : ''}>
                {p.name} {p.id === myId && '(Você)'}
              </span>
              {master === p.id && <Shield size={12} className="text-emerald-400" />}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
