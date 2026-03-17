import React, { useState, useRef, useEffect } from 'react';
import { useGameSocket } from './hooks/useGameSocket';
import { Header } from './components/Header';
import { RulesModal } from './components/RulesModal';
import { JoinScreen } from './components/JoinScreen';
import { ChatPanel } from './components/ChatPanel';
import { WordDisplay } from './components/WordDisplay';
import { MasterPanel } from './components/MasterPanel';
import { ClueSection } from './components/ClueSection';

export default function App() {
  const [name, setName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [showRules, setShowRules] = useState(false);
  
  // Custom Hook for Socket Logic
  const { myId, gameState, ws, error, setError, chatMessages, sendAction } = useGameSocket(name, isJoined, setIsJoined);

  // Local Input States
  const [wordInput, setWordInput] = useState('');
  const [clueInput, setClueInput] = useState('');
  const [clueWordInput, setClueWordInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [contactInputs, setContactInputs] = useState<Record<string, string>>({});
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!isJoined) {
    return (
      <>
        <JoinScreen 
          name={name} 
          setName={setName} 
          error={error} 
          handleJoin={(e) => { e.preventDefault(); if (name.trim()) { setError(''); setIsJoined(true); } }}
          setShowRules={setShowRules}
        />
        <RulesModal showRules={showRules} setShowRules={setShowRules} />
      </>
    );
  }

  if (!gameState) return null;

  const isMaster = gameState.master === myId;
  const isWon = gameState.gameStatus === 'won';

  // Handlers
  const handleBecomeMaster = () => sendAction('BECOME_MASTER', { name });
  const handleSetWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (wordInput.trim()) {
      sendAction('SET_WORD', { word: wordInput.trim() });
      setWordInput('');
    }
  };
  const handleSendClue = (e: React.FormEvent) => {
    e.preventDefault();
    if (clueInput.trim() && clueWordInput.trim()) {
      sendAction('SEND_CLUE', { text: clueInput.trim(), authorWord: clueWordInput.trim() });
      setClueInput('');
      setClueWordInput('');
    }
  };
  const handleContact = (clueId: string, e: React.FormEvent) => {
    e.preventDefault();
    const guessWord = contactInputs[clueId];
    if (guessWord?.trim()) {
      sendAction('CONTACT', { clueId, guessWord: guessWord.trim() });
      setContactInputs(prev => { const n = {...prev}; delete n[clueId]; return n; });
    }
  };
  const handleBlock = (clueId: string, e: React.FormEvent) => {
    e.preventDefault();
    const guessWord = contactInputs[clueId];
    if (guessWord?.trim()) {
      sendAction('BLOCK', { clueId, masterGuess: guessWord.trim() });
      setContactInputs(prev => { const n = {...prev}; delete n[clueId]; return n; });
    }
  };
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendAction('CHAT_MESSAGE', { player: name, text: chatInput.trim() });
      setChatInput('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <Header 
        playersCount={gameState.players.length} 
        setShowRules={setShowRules} 
        onReset={() => sendAction('RESET')} 
      />

      <RulesModal showRules={showRules} setShowRules={setShowRules} />

      <main className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <MasterPanel 
            master={gameState.master}
            masterName={gameState.masterName}
            isMaster={isMaster}
            hasWord={!!gameState.word}
            players={gameState.players}
            myId={myId}
            becomeMaster={handleBecomeMaster}
            wordInput={wordInput}
            setWordInput={setWordInput}
            setWord={handleSetWord}
          />
          
          <ChatPanel 
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            sendChatMessage={handleSendChat}
            chatEndRef={chatEndRef}
            playerName={name}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <WordDisplay 
            hasWord={!!gameState.word}
            word={gameState.word}
            revealedLetters={gameState.revealedLetters}
            isWon={isWon}
            onReset={() => sendAction('RESET')}
          />

          <ClueSection 
            clues={gameState.clues}
            isMaster={isMaster}
            isWon={isWon}
            hasWord={!!gameState.word}
            playerName={name}
            clueInput={clueInput}
            setClueInput={setClueInput}
            clueWordInput={clueWordInput}
            setClueWordInput={setClueWordInput}
            sendClue={handleSendClue}
            contactInputs={contactInputs}
            updateContactInput={(id, val) => setContactInputs(p => ({...p, [id]: val}))}
            onContact={handleContact}
            onBlock={handleBlock}
          />
        </div>
      </main>
    </div>
  );
}
