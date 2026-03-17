import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Send, Shield, Zap, RotateCcw, User, MessageSquare, AlertCircle } from 'lucide-react';

type Player = { id: string; name: string };
type Clue = {
  id: string;
  player: string;
  text: string;
  authorWord: string;
  status: 'pending' | 'contacted' | 'blocked' | 'resolved' | 'failed';
  contactPlayer?: string;
  guessWord?: string;
  countdown?: number;
};

type GameState = {
  master: string | null;
  masterName: string;
  word: string;
  revealedLetters: string;
  players: Player[];
  clues: Clue[];
};

export default function App() {
  const [name, setName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [myId, setMyId] = useState('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [wordInput, setWordInput] = useState('');
  const [clueInput, setClueInput] = useState('');
  const [clueWordInput, setClueWordInput] = useState('');
  const [contactInputs, setContactInputs] = useState<Record<string, string>>({});
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isJoined) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socket = new WebSocket(`${protocol}//${window.location.host}`);

      socket.onopen = () => {
        socket.send(JSON.stringify({ type: 'JOIN', name }));
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'INIT':
            setMyId(data.id);
            setGameState(data.state);
            break;
          case 'STATE_UPDATE':
            setGameState(data.state);
            break;
          case 'PLAYER_JOINED':
          case 'PLAYER_LEFT':
            setGameState(prev => prev ? { ...prev, players: data.players, master: data.master ?? prev.master } : null);
            break;
        }
      };

      socket.onclose = () => {
        setIsJoined(false);
        setError('Conexão perdida. Tente entrar novamente.');
      };

      setWs(socket);
      return () => socket.close();
    }
  }, [isJoined]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsJoined(true);
    }
  };

  const becomeMaster = () => {
    ws?.send(JSON.stringify({ type: 'BECOME_MASTER', name }));
  };

  const setWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (wordInput.trim()) {
      ws?.send(JSON.stringify({ type: 'SET_WORD', word: wordInput }));
      setWordInput('');
    }
  };

  const sendClue = (e: React.FormEvent) => {
    e.preventDefault();
    if (clueInput.trim() && clueWordInput.trim()) {
      ws?.send(JSON.stringify({ type: 'SEND_CLUE', text: clueInput, authorWord: clueWordInput }));
      setClueInput('');
      setClueWordInput('');
    }
  };

  const updateContactInput = (clueId: string, word: string) => {
    setContactInputs(prev => ({ ...prev, [clueId]: word }));
  };

  const contactClue = (clueId: string, e: React.FormEvent) => {
    e.preventDefault();
    const guessWord = contactInputs[clueId];
    if (guessWord && guessWord.trim()) {
      ws?.send(JSON.stringify({ type: 'CONTACT', clueId, guessWord: guessWord.trim() }));
      setContactInputs(prev => {
        const newState = { ...prev };
        delete newState[clueId];
        return newState;
      });
    }
  };

  const blockClue = (clueId: string) => {
    ws?.send(JSON.stringify({ type: 'BLOCK', clueId }));
  };

  const resetGame = () => {
    ws?.send(JSON.stringify({ type: 'RESET' }));
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
              <Zap className="text-emerald-400 w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center mb-2 tracking-tight">CONTATO</h1>
          <p className="text-gray-400 text-center mb-8 text-sm">O jogo de sintonia e adivinhação</p>
          
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
              Entrar na Sala
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (!gameState) return null;

  const isMaster = gameState.master === myId;
  const hasWord = !!gameState.word;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Header */}
      <header className="border-bottom border-white/5 bg-[#0f0f0f]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Zap className="text-emerald-400 w-5 h-5" />
            <h1 className="font-bold tracking-tight text-lg">CONTATO</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Users size={16} className="text-gray-400" />
              <span className="text-sm font-medium">{gameState.players.length}</span>
            </div>
            <button 
              onClick={resetGame}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400"
              title="Reiniciar Jogo"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Game Info & Master Control */}
        <div className="space-y-6">
          <section className="bg-[#141414] border border-white/10 rounded-2xl p-6">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield size={14} /> O Mestre
            </h2>
            {gameState.master ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                  <User size={20} className="text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold">{gameState.masterName}</p>
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
              {gameState.players.map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm py-1 border-b border-white/5 last:border-0">
                  <span className={p.id === myId ? 'text-emerald-400 font-medium' : ''}>
                    {p.name} {p.id === myId && '(Você)'}
                  </span>
                  {gameState.master === p.id && <Shield size={12} className="text-emerald-400" />}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Center Column: Game Board */}
        <div className="lg:col-span-2 space-y-6">
          {/* Word Display */}
          <section className="bg-[#141414] border border-white/10 rounded-2xl p-8 text-center">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Palavra Revelada</h2>
            <div className="flex justify-center gap-2">
              {hasWord ? (
                gameState.word.split('').map((char, i) => (
                  <div 
                    key={i} 
                    className={`w-12 h-16 rounded-xl flex items-center justify-center text-3xl font-black border transition-all
                      ${i < gameState.revealedLetters.length 
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                        : 'bg-black/40 border-white/5 text-transparent'}`}
                  >
                    {i < gameState.revealedLetters.length ? char : ''}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">Aguardando o mestre definir a palavra...</p>
              )}
            </div>
          </section>

          {/* Clues Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={14} /> Pistas Ativas
              </h2>
              {!isMaster && hasWord && (
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
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// skip unchanged loop condition and parent div since React will figure it out
              <AnimatePresence mode="popLayout">
                {gameState.clues.filter(c => c.status !== 'resolved' && c.status !== 'failed').map(clue => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={clue.id}
                    className={`flex flex-col p-5 rounded-2xl border transition-all ${
                      clue.status === 'contacted' 
                        ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20' 
                        : 'bg-[#141414] border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded">
                        {clue.player}
                      </span>
                      {clue.status === 'contacted' && (
                        <div className="flex items-center gap-2 text-emerald-400 font-black text-xl">
                          {clue.countdown}
                        </div>
                      )}
                    </div>
                    <p className="text-lg font-medium leading-tight mb-4">{clue.text}</p>
                    
                    <div className="flex gap-2">
                      {isMaster ? (
                        <button 
                          onClick={() => blockClue(clue.id)}
                          className="flex-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 py-2 rounded-xl text-xs font-bold transition-colors"
                        >
                          BLOQUEAR
                        </button>
                      ) : (
                        clue.status === 'pending' && clue.player !== name && (
                          <form 
                            onSubmit={(e) => contactClue(clue.id, e)}
                            className="flex-1 flex gap-2"
                          >
                            <input
                              type="text"
                              value={contactInputs[clue.id] || ''}
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
                    {clue.status === 'blocked' && (
                      <p className="text-[10px] text-red-400 mt-3 font-medium text-center uppercase tracking-widest">
                        Mestre bloqueou!
                      </p>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {gameState.clues.filter(c => c.status !== 'resolved' && c.status !== 'failed').length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                  <p className="text-gray-500 text-sm">Nenhuma pista ativa no momento.</p>
                </div>
              )}
            </div>
          </section>

          {/* Resolved History */}
          <section className="bg-[#141414]/50 border border-white/5 rounded-2xl p-6">
            <h2 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Histórico de Contatos</h2>
            <div className="flex flex-col gap-3">
              {gameState.clues.filter(c => c.status === 'resolved' || c.status === 'failed').map(c => (
                <div key={c.id} className={`flex flex-col gap-1 border-l-2 pl-3 py-1 ${
                  c.status === 'resolved' ? 'border-emerald-500/50 text-emerald-100' : 'border-red-500/50 text-red-100'
                }`}>
                  <p className="text-sm">"{c.text}"</p>
                  <div className="flex gap-2 text-xs opacity-75">
                    <span><strong className="opacity-100">{c.player}</strong>: {c.authorWord}</span>
                    <span className="opacity-50">•</span>
                    <span><strong className="opacity-100">{c.contactPlayer}</strong>: {c.guessWord}</span>
                  </div>
                </div>
              ))}
              {gameState.clues.filter(c => c.status === 'resolved' || c.status === 'failed').length === 0 && (
                <p className="text-gray-600 text-xs italic">Nenhum contato realizado ainda.</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
