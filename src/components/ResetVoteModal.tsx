import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { RotateCcw, Vote, X } from 'lucide-react';

type ResetVoteModalProps = {
  open: boolean;
  roomCode: string;
  requestedByName?: string;
  votesCount: number;
  requiredVotes: number;
  hasVoted: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ResetVoteModal({
  open,
  roomCode,
  requestedByName,
  votesCount,
  requiredVotes,
  hasVoted,
  onClose,
  onConfirm,
}: ResetVoteModalProps) {
  const title = requestedByName ? 'Votar para reiniciar' : 'Iniciar votação de reinício';
  const description = requestedByName
    ? `${requestedByName} pediu para reiniciar a partida da sala ${roomCode}.`
    : `Isso abre uma votação para reiniciar a partida da sala ${roomCode}.`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <div className="mb-5 flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
                {requestedByName ? <Vote size={20} /> : <RotateCcw size={20} />}
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
                <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">Maioria simples aprova</p>
              </div>
            </div>

            <p className="text-sm leading-6 text-gray-300">{description}</p>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Progresso da votação</p>
              <p className="mt-2 text-2xl font-black text-white">{votesCount} / {requiredVotes}</p>
              <p className="mt-1 text-sm text-gray-400">Quando atingir a maioria da sala, a partida reinicia para todo mundo.</p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-gray-200 transition-colors hover:bg-white/10"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={hasVoted}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
              >
                {hasVoted ? 'Voto registrado' : requestedByName ? 'reiniciar' : 'Abrir votação'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
