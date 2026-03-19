import React, { useState, useRef, useEffect } from 'react';
import { useGameSocket } from './hooks/useGameSocket';
import { Header } from './components/Header';
import { RulesModal } from './components/RulesModal';
import { ResetVoteModal } from './components/ResetVoteModal';
import { ResetVoteBanner } from './components/ResetVoteBanner';
import { JoinScreen } from './components/JoinScreen';
import { RoomScreen } from './components/RoomScreen';
import { ChatPanel } from './components/ChatPanel';
import { WordDisplay } from './components/WordDisplay';
import { MasterPanel } from './components/MasterPanel';
import { ClueSection } from './components/ClueSection';

export default function App() {
  const [name, setName] = useState('');
  const [currentScreen, setCurrentScreen] = useState<'name' | 'rooms' | 'game'>('name');
  const [showRules, setShowRules] = useState(false);
  const [showResetVoteModal, setShowResetVoteModal] = useState(false);
  
  const { myId, gameState, error, setError, chatMessages, sendAction, connectToRoom, leaveRoom, isConnecting } = useGameSocket(name, {
    onJoined: () => setCurrentScreen('game'),
    onDisconnected: () => setCurrentScreen('rooms'),
  });

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

  useEffect(() => {
    if (currentScreen !== 'game') {
      return;
    }

    if (!gameState?.resetVote) {
      setShowResetVoteModal(false);
    }
  }, [currentScreen, gameState?.resetVote]);

  if (currentScreen === 'name') {
    return (
      <>
        <JoinScreen 
          name={name} 
          setName={setName} 
          error={error} 
          handleJoin={(e) => { e.preventDefault(); if (name.trim()) { setError(''); setCurrentScreen('rooms'); } }}
          setShowRules={setShowRules}
        />
        <RulesModal showRules={showRules} setShowRules={setShowRules} />
      </>
    );
  }

  if (currentScreen === 'rooms') {
    return (
      <>
        <RoomScreen
          name={name}
          error={error}
          isConnecting={isConnecting}
          onCreateRoom={() => connectToRoom({ mode: 'create' })}
          onJoinRoom={(roomCode) => connectToRoom({ mode: 'join', roomCode })}
        />
        <RulesModal showRules={showRules} setShowRules={setShowRules} />
      </>
    );
  }

  if (!gameState) return null;

  const isMaster = gameState.master === myId;
  const isWon = gameState.gameStatus === 'won';
  const resetVotesCount = gameState.resetVote?.votes.length ?? 0;
  const requiredResetVotes = Math.floor(gameState.players.length / 2) + 1;
  const hasVotedForReset = gameState.resetVote?.votes.includes(myId) ?? false;

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

  const handleLeaveRoom = () => {
    leaveRoom();
    setCurrentScreen('rooms');
    setShowResetVoteModal(false);
    setWordInput('');
    setClueInput('');
    setClueWordInput('');
    setChatInput('');
    setContactInputs({});
  };

  const handleResetVoteConfirm = () => {
    sendAction(gameState.resetVote ? 'VOTE_RESET' : 'REQUEST_RESET');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <Header 
        playersCount={gameState.players.length} 
        roomCode={gameState.roomCode}
        resetVotesCount={resetVotesCount}
        requiredResetVotes={requiredResetVotes}
        setShowRules={setShowRules} 
        onOpenResetVote={() => setShowResetVoteModal(true)}
        onLeaveRoom={handleLeaveRoom}
      />

      <RulesModal showRules={showRules} setShowRules={setShowRules} />
      <ResetVoteModal
        open={showResetVoteModal}
        roomCode={gameState.roomCode}
        requestedByName={gameState.resetVote?.requestedByName}
        votesCount={resetVotesCount}
        requiredVotes={requiredResetVotes}
        hasVoted={hasVotedForReset}
        onClose={() => setShowResetVoteModal(false)}
        onConfirm={handleResetVoteConfirm}
      />

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
          {gameState.resetVote && (
            <ResetVoteBanner
              requestedByName={gameState.resetVote.requestedByName}
              votesCount={resetVotesCount}
              requiredVotes={requiredResetVotes}
              hasVoted={hasVotedForReset}
              onOpenVoteModal={() => setShowResetVoteModal(true)}
            />
          )}

          <WordDisplay 
            hasWord={!!gameState.word}
            word={gameState.word}
            revealedLetters={gameState.revealedLetters}
            isWon={isWon}
            onOpenResetVote={() => setShowResetVoteModal(true)}
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
