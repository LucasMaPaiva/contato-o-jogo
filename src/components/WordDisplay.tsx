import React from 'react';
import { motion } from 'motion/react';

type WordDisplayProps = {
  hasWord: boolean;
  word: string;
  revealedLetters: string;
  isWon: boolean;
  onOpenResetVote: () => void;
};

export function WordDisplay({ hasWord, word, revealedLetters, isWon, onOpenResetVote }: WordDisplayProps) {
  return (
    <section className={`border rounded-2xl p-8 text-center transition-all ${isWon ? 'bg-emerald-500/10 border-emerald-500 shadow-xl shadow-emerald-500/20' : 'bg-[#141414] border-white/10'}`}>
      <h2 className={`text-xs font-bold uppercase tracking-widest mb-6 ${isWon ? 'text-emerald-400' : 'text-gray-500'}`}>
        {isWon ? '🎉 PALAVRA DESCOBERTA! 🎉' : 'Palavra Revelada'}
      </h2>
      <div className="flex justify-center gap-2 flex-wrap pb-4">
        {hasWord ? (
          word.split('').map((char, i) => (
            <div
              key={i}
              className={`w-12 h-16 rounded-xl flex flex-shrink-0 items-center justify-center text-3xl font-black border transition-all
                ${i < revealedLetters.length
                  ? (isWon ? 'bg-emerald-500 text-black border-transparent scale-110 shadow-lg' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400')
                  : 'bg-black/40 border-white/5 text-transparent'}`}
            >
              {i < revealedLetters.length ? char : ''}
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">Aguardando o mestre definir a palavra...</p>
        )}
      </div>
      {isWon && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <p className="text-xl font-bold text-white mb-2">Os adivinhadores venceram!</p>
          <button
            onClick={onOpenResetVote}
            className="mt-2 bg-white text-black font-bold px-8 py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Votar para Jogar Novamente
          </button>
        </motion.div>
      )}
    </section>
  );
}
