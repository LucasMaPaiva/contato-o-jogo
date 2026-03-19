import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Copy, DoorOpen, PlusSquare, Sparkles } from 'lucide-react';

type RoomScreenProps = {
  name: string;
  error: string;
  isConnecting: boolean;
  onCreateRoom: () => void;
  onJoinRoom: (roomCode: string) => void;
};

export function RoomScreen({ name, error, isConnecting, onCreateRoom, onJoinRoom }: RoomScreenProps) {
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
  const [roomCode, setRoomCode] = useState('');

  const normalizedCode = useMemo(() => roomCode.trim().toUpperCase(), [roomCode]);

  const handleJoin = (event: React.FormEvent) => {
    event.preventDefault();
    if (normalizedCode) {
      onJoinRoom(normalizedCode);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-[#141414] shadow-2xl"
      >
        <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
          <div className="border-b border-white/10 p-8 md:border-b-0 md:border-r">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
              <Sparkles size={14} /> Lobby de salas
            </div>
            <h1 className="max-w-sm text-4xl font-black tracking-[-0.04em] text-white">Escolha como você vai jogar.</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-gray-400">
              Crie uma nova sala ou entre em uma sala existente.
            </p>

            <div className="mt-8 flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-2">
              <button
                type="button"
                onClick={() => setActiveTab('join')}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${activeTab === 'join' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-white/5'}`}
              >
                Entrar em sala
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${activeTab === 'create' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-white/5'}`}
              >
                Criar sala
              </button>
            </div>

            {error && (
              <p className="mt-5 flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                <AlertCircle size={16} /> {error}
              </p>
            )}
          </div>

          <div className="p-8">
            {activeTab === 'join' ? (
              <form onSubmit={handleJoin} className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">Entrar em uma sala</p>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight">Cole ou digite o codigo</h2>
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Codigo da sala</span>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
                    placeholder="CONT-ASD234"
                    className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-4 text-lg font-semibold tracking-[0.2em] text-white outline-none transition placeholder:text-gray-500 focus:border-emerald-500/50"
                    autoFocus
                    maxLength={11}
                  />
                </label>

                <button
                  type="submit"
                  disabled={!normalizedCode || isConnecting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-4 font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
                >
                  <DoorOpen size={18} /> {isConnecting ? 'Entrando...' : 'Entrar agora'}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">Criar uma sala</p>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight">O sistema gera o codigo automaticamente</h2>
                </div>

                <div className="rounded-[24px] border border-dashed border-emerald-500/30 bg-emerald-500/10 p-5">
                  <div className="flex items-center gap-3 text-emerald-300">
                    <Copy size={18} />
                    <span className="text-sm leading-6">
                      Ao criar, voce entra direto na sala e pode compartilhar o codigo no cabecalho da partida.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onCreateRoom}
                  disabled={isConnecting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-4 font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
                >
                  <PlusSquare size={18} /> {isConnecting ? 'Criando...' : 'Criar sala e entrar'}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
