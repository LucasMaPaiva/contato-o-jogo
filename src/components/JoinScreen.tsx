import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle, Zap, AlertCircle } from 'lucide-react';

type JoinScreenProps = {
  name: string;
  setName: (v: string) => void;
  error: string;
  handleJoin: (e: React.FormEvent) => void;
  setShowRules: (v: boolean) => void;
};

export function JoinScreen({ name, setName, error, handleJoin, setShowRules }: JoinScreenProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#141414] p-8 shadow-2xl"
      >
        <div className="flex justify-between items-start mb-6 w-full">
          <button
             onClick={() => setShowRules(true)}
             className="absolute left-4 top-4 rounded-full border border-white/10 p-2 text-gray-400 transition-colors hover:bg-white/5"
             title="Como Jogar"
          >
            <HelpCircle size={18} />
          </button>
           <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20">
             <Zap className="text-emerald-400 w-8 h-8" />
           </div>
         </div>
        <h1 className="mb-2 text-center text-3xl font-bold tracking-tight">CONTATO</h1>
        <p className="mb-8 text-center text-sm text-gray-400">Primeiro escolha como quer ser chamado na mesa.</p>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Seu Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como quer ser chamado?"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors"
              autoFocus
            />
          </div>
          {error && <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}
          <button
            type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
            >
              Continuar
            </button>
        </form>
      </motion.div>
    </div>
  );
}
