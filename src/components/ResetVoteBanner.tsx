import React from 'react';
import { Vote } from 'lucide-react';

type ResetVoteBannerProps = {
  requestedByName: string;
  votesCount: number;
  requiredVotes: number;
  hasVoted: boolean;
  onOpenVoteModal: () => void;
};

export function ResetVoteBanner({
  requestedByName,
  votesCount,
  requiredVotes,
  hasVoted,
  onOpenVoteModal,
}: ResetVoteBannerProps) {
  return (
    <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-amber-100 shadow-lg shadow-black/10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300">
            <Vote size={18} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300/80">Votacao em andamento</p>
            <p className="mt-1 text-sm text-amber-50">
              {requestedByName} pediu para reiniciar a partida. Votos: <strong>{votesCount}/{requiredVotes}</strong>.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenVoteModal}
          className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-amber-200"
        >
          {hasVoted ? 'Ver votacao' : 'Votar agora'}
        </button>
      </div>
    </div>
  );
}
