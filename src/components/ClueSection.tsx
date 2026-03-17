import React from 'react';
import { AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Shield } from 'lucide-react';
import { Clue } from '../types/game';
import { ClueItem } from './ClueItem';

type ClueSectionProps = {
  clues: Clue[];
  isMaster: boolean;
  isWon: boolean;
  hasWord: boolean;
  playerName: string;
  clueInput: string;
  setClueInput: (v: string) => void;
  clueWordInput: string;
  setClueWordInput: (v: string) => void;
  sendClue: (e: React.FormEvent) => void;
  contactInputs: Record<string, string>;
  updateContactInput: (id: string, val: string) => void;
  onContact: (clueId: string, e: React.FormEvent) => void;
  onBlock: (clueId: string, e: React.FormEvent) => void;
};

export function ClueSection({ 
  clues, isMaster, isWon, hasWord, playerName, 
  clueInput, setClueInput, clueWordInput, setClueWordInput, sendClue,
  contactInputs, updateContactInput, onContact, onBlock 
}: ClueSectionProps) {
  
  const activeClues = clues.filter(c => c.status === 'pending' || c.status === 'contacted');
  const hasActiveClue = activeClues.length > 0;
  const burnedWords = clues.filter(c => c.status === 'blocked');
  const history = clues.filter(c => c.status === 'resolved' || c.status === 'failed');

  return (
    <div className="lg:col-span-2 space-y-6">
      {!isWon && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={14} /> Pistas Ativas
            </h2>
            {!isMaster && hasWord && !isWon && (
              !hasActiveClue ? (
                <form onSubmit={sendClue} className="flex gap-2 w-full max-w-lg justify-end">
                  <input
                    type="text"
                    value={clueInput}
                    onChange={(e) => setClueInput(e.target.value)}
                    placeholder="Sua dica..."
                    className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                  <input
                    type="text"
                    value={clueWordInput}
                    onChange={(e) => setClueWordInput(e.target.value)}
                    placeholder="Palavra secreta..."
                    className="w-32 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                  <button type="submit" className="p-2 bg-emerald-600 rounded-full hover:bg-emerald-500 flex-shrink-0">
                    <Send size={14} />
                  </button>
                </form>
              ) : (
                <p className="text-xs text-yellow-500/80 italic font-medium pr-2">Aguardando resolução do contato em andamento...</p>
              )
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {activeClues.map(clue => (
                <ClueItem 
                  key={clue.id}
                  clue={clue}
                  isMaster={isMaster}
                  playerName={playerName}
                  contactWord={contactInputs[clue.id] || ''}
                  updateContactInput={updateContactInput}
                  onContact={onContact}
                  onBlock={onBlock}
                />
              ))}
            </AnimatePresence>

            {!hasActiveClue && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                <p className="text-gray-500 text-sm">Nenhuma pista ativa no momento.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Burned Words */}
      <section className="bg-[#141414]/50 border border-white/5 rounded-2xl p-6">
        <h2 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Palavras Queimadas (Bloqueadas)</h2>
        <div className="flex flex-wrap gap-2">
          {burnedWords.map(c => (
            <div key={c.id} className="bg-red-900/20 border border-red-500/30 text-red-200 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
              <Shield size={14} className="text-red-500" />
              <span className="font-bold line-through opacity-80">{c.authorWord}</span>
              <span className="text-xs opacity-50 ml-1">({c.player})</span>
            </div>
          ))}
          {burnedWords.length === 0 && (
            <p className="text-gray-600 text-xs italic">Nenhuma palavra foi bloqueada pelo Mestre ainda.</p>
          )}
        </div>
      </section>

      {/* History */}
      <section className="bg-[#141414]/50 border border-white/5 rounded-2xl p-6">
        <h2 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Histórico de Contatos</h2>
        <div className="flex flex-col gap-3">
          {history.map(c => (
            <div key={c.id} className={`flex flex-col gap-1 border-l-2 pl-3 py-1 ${c.status === 'resolved' ? 'border-emerald-500/50 text-emerald-100' : 'border-red-500/50 text-red-100'}`}>
              <p className="text-sm">"{c.text}"</p>
              <div className="flex gap-2 text-xs opacity-75">
                <span><strong className="opacity-100">{c.player}</strong>: {c.authorWord}</span>
                <span className="opacity-50">•</span>
                <span><strong className="opacity-100">{c.contactPlayer}</strong>: {c.guessWord}</span>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <p className="text-gray-600 text-xs italic">Nenhum contato realizado ainda.</p>
          )}
        </div>
      </section>
    </div>
  );
}
