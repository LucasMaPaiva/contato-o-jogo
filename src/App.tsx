import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Send, Shield, Zap, RotateCcw, User, MessageSquare, AlertCircle, HelpCircle, X } from 'lucide-react';

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
  gameStatus: 'playing' | 'won';
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
  const [showRules, setShowRules] = useState(false);

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

  const blockClue = (clueId: string, e: React.FormEvent) => {
    e.preventDefault();
    const guessWord = contactInputs[clueId];
    if (guessWord && guessWord.trim()) {
      ws?.send(JSON.stringify({ type: 'BLOCK', clueId, masterGuess: guessWord.trim() }));
      setContactInputs(prev => {
        const newState = { ...prev };
        delete newState[clueId];
        return newState;
      });
    }
  };

  const resetGame = () => {
    ws?.send(JSON.stringify({ type: 'RESET' }));
  };

  const RulesModal = () => (
    <AnimatePresence>
      {showRules && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 pt-16 lg:p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto relative shadow-2xl"
          >
            <button 
              onClick={() => setShowRules(false)}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30 text-emerald-400">
                 <HelpCircle size={20} /> 
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">Como Jogar Contato</h2>
            </div>
            
            <div className="space-y-4 text-sm text-gray-300">
              <p>O <strong>Contato</strong> é um jogo cooperativo de adivinhação. O objetivo é que os adivinhadores descubram a <strong className="text-emerald-400">Palavra Secreta</strong> definida pelo Mestre.</p>

              <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
                <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-xs">A Dinâmica</h3>
                <ul className="list-disc pl-4 space-y-1.5 marker:text-emerald-500/50">
                  <li>O <strong>Mestre</strong> pensa numa Palavra Secreta e o jogo mostra apenas ela em branco.</li>
                  <li>No início (e a cada Contato com Sucesso), as letras vão sendo reveladas da primeira pra última (ex: "A", dps "AM", dps "AMI", etc).</li>
                  <li>O objetivo dos adivinhadores (os outros) é ir sugerindo palavras-pista que <strong className="text-white">COMEÇAM COM AS MESMAS LETRAS ATUAIS</strong> reveladas.</li>
                  <li><strong>Exemplo:</strong> Se a palavra é "Amizade" e não há letras, um jogador envia a pista "Fruta ácida e amarela" e diz pro jogo que a palavra dele é "Abacaxi".</li>
                </ul>
              </div>

              <div className="bg-emerald-900/10 p-4 rounded-xl border border-emerald-500/20 space-y-3 mt-4">
                <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2"><Zap size={14} /> Contato!</h3>
                <p>O jogador envia a pista para que os DEMAIS leiam e tentem pensar na mesma palavra que ele. Quando outro adivinhador acha que sabe a resposta para a pista (ex: descobre que é "Abacaxi"), ele aperta em <strong>CONTATO</strong>!</p>
                <ul className="list-disc pl-4 space-y-1.5 text-emerald-200/80 marker:text-emerald-500">
                  <li>Inicia-se uma contagem regressiva de 5 segundos.</li>
                  <li>No final, as palavras dos dois jogadores (o Autor da pista e quem tentou o Contato) são reveladas ao Mestre.</li>
                  <li><strong>Se as palavras baterem</strong>: O Contato foi um SUCESSO! O Mestre é forçado a revelar <strong>mais 1 letra</strong> da sua Palavra Secreta Oficial.</li>
                  <li><strong>Se não baterem</strong>: A pista morre (Falhou), e o Mestre respira aliviado.</li>
                </ul>
              </div>

              <div className="bg-red-900/10 p-4 rounded-xl border border-red-500/20 space-y-3 mt-4">
                <h3 className="text-red-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2"><Shield size={14} /> A Defesa do Mestre</h3>
                <p>O Mestre entra em desespero quando vê que o grupo deu Contato e os 5 segundos estão rolando. A meta do Mestre é não deixar os jogadores ganharem letras!</p>
                <ul className="list-disc pl-4 space-y-1.5 text-red-200/80 marker:text-red-500">
                  <li>Para "Quebrar" o contato, o Mestre deve ler a pista que o Autor deu, e durante o tempo correr para adivinhar qual é ela.</li>
                  <li>Se o Mestre acertar e apertar o botão de Quebrar antes de dar contato, a palavra da pista fica <strong>Queimada/Bloqueada</strong> e ninguém consegue completá-la.</li>
                </ul>
              </div>

              <div className="bg-yellow-900/10 p-4 rounded-xl border border-yellow-500/20 space-y-3 mt-4">
                <h3 className="text-yellow-400 font-bold uppercase tracking-wider text-xs">👑 Condição de Vitória</h3>
                <p>A qualquer momento — seja por completarem a palavra ou porque a dica oficial do um autor já era logo de cara a própria <strong>Palavra Secreta Oculta</strong> — quando os Adivinhadores dão palpite exato à do Mestre, a vitória Global acontece instantaneamente.</p>
              </div>

            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
              <button 
                onClick={() => setShowRules(false)}
                className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-xl text-white font-bold transition-colors"
               >
                Entendi, Vamos Jogar!
               </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <div className="flex justify-between items-start mb-6 w-full">
            <button
               onClick={() => setShowRules(true)}
               className="p-2 border border-white/10 text-gray-400 rounded-full hover:bg-white/5 transition-colors absolute top-4 left-4"
               title="Como Jogar"
            >
              <HelpCircle size={18} />
            </button>
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30 mx-auto">
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
          <RulesModal />
        </motion.div>
      </div>
    );
  }

  if (!gameState) return null;

  const isMaster = gameState.master === myId;
  const hasWord = !!gameState.word;
  const hasActiveClue = gameState.clues.some(c => c.status === 'pending' || c.status === 'contacted');
  const isWon = gameState.gameStatus === 'won';

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
              onClick={() => setShowRules(true)}
              className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 rounded-full text-xs font-bold transition-all flex items-center gap-2"
              title="Como Jogar"
            >
               <HelpCircle size={14} /> REGRAS
            </button>
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

      <RulesModal />

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
          <section className={`border rounded-2xl p-8 text-center transition-all ${isWon ? 'bg-emerald-500/10 border-emerald-500 shadow-xl shadow-emerald-500/20' : 'bg-[#141414] border-white/10'}`}>
            <h2 className={`text-xs font-bold uppercase tracking-widest mb-6 ${isWon ? 'text-emerald-400' : 'text-gray-500'}`}>
              {isWon ? '🎉 PALAVRA DESCOBERTA! 🎉' : 'Palavra Revelada'}
            </h2>
            <div className="flex justify-center gap-2 flex-wrap pb-4">
              {hasWord ? (
                gameState.word.split('').map((char, i) => (
                  <div
                    key={i}
                    className={`w-12 h-16 rounded-xl flex flex-shrink-0 items-center justify-center text-3xl font-black border transition-all
                      ${i < gameState.revealedLetters.length
                        ? (isWon ? 'bg-emerald-500 text-black border-transparent scale-110 shadow-lg' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400')
                        : 'bg-black/40 border-white/5 text-transparent'}`}
                  >
                    {i < gameState.revealedLetters.length ? char : ''}
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
                  onClick={resetGame}
                  className="mt-2 bg-white text-black font-bold px-8 py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Jogar Novamente
                </button>
              </motion.div>
            )}
          </section>

          {/* Clues Section */}
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
                  {gameState.clues.filter(c => c.status === 'pending' || c.status === 'contacted').map(clue => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={clue.id}
                      className={`flex flex-col p-5 rounded-2xl border transition-all ${clue.status === 'contacted'
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
                          <form 
                            onSubmit={(e) => blockClue(clue.id, e)}
                            className="flex-1 flex gap-2"
                          >
                            <input
                              type="text"
                              value={contactInputs[clue.id] || ''}
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

                {gameState.clues.filter(c => c.status === 'pending' || c.status === 'contacted').length === 0 && (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                    <p className="text-gray-500 text-sm">Nenhuma pista ativa no momento.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="bg-[#141414]/50 border border-white/5 rounded-2xl p-6 mb-6">
            <h2 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Palavras Queimadas (Bloqueadas)</h2>
            <div className="flex flex-wrap gap-2">
              {gameState.clues.filter(c => c.status === 'blocked').map(c => (
                <div key={c.id} className="bg-red-900/20 border border-red-500/30 text-red-200 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                  <Shield size={14} className="text-red-500" />
                  <span className="font-bold line-through opacity-80">{c.authorWord}</span>
                  <span className="text-xs opacity-50 ml-1">({c.player})</span>
                </div>
              ))}
              {gameState.clues.filter(c => c.status === 'blocked').length === 0 && (
                <p className="text-gray-600 text-xs italic">Nenhuma palavra foi bloqueada pelo Mestre ainda.</p>
              )}
            </div>
          </section>

          {/* Resolved History */}
          <section className="bg-[#141414]/50 border border-white/5 rounded-2xl p-6">
            <h2 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Histórico de Contatos</h2>
            <div className="flex flex-col gap-3">
              {gameState.clues.filter(c => c.status === 'resolved' || c.status === 'failed').map(c => (
                <div key={c.id} className={`flex flex-col gap-1 border-l-2 pl-3 py-1 ${c.status === 'resolved' ? 'border-emerald-500/50 text-emerald-100' : 'border-red-500/50 text-red-100'
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
