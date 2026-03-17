import { WebSocket } from "ws";
import { gameState, broadcast, resetGameState } from "./game-state";

export function handleSocketMessage(ws: WebSocket, wss: any, id: string, message: string) {
  const data = JSON.parse(message);

  switch (data.type) {
    case "JOIN":
      handleJoin(ws, wss, id, data.name);
      break;
    case "BECOME_MASTER":
      handleBecomeMaster(wss, id, data.name);
      break;
    case "SET_WORD":
      handleSetWord(wss, id, data.word);
      break;
    case "SEND_CLUE":
      handleSendClue(wss, id, data.text, data.authorWord);
      break;
    case "CONTACT":
      handleContact(wss, id, data.clueId, data.guessWord);
      break;
    case "BLOCK":
      handleBlock(wss, id, data.clueId, data.masterGuess);
      break;
    case "CHAT_MESSAGE":
      handleChatMessage(wss, data.player, data.text);
      break;
    case "RESET":
      handleReset(wss);
      break;
  }
}

function handleJoin(ws: WebSocket, wss: any, id: string, name: string) {
  const nameExists = gameState.players.some(p => p.name.toLowerCase() === name.toLowerCase());
  if (nameExists) {
    ws.send(JSON.stringify({ type: "ERROR", message: "Nome de usuário já está em uso." }));
    return;
  }
  gameState.players.push({ id, name });
  ws.send(JSON.stringify({ type: "INIT", id, state: gameState }));
  broadcast(wss, { type: "PLAYER_JOINED", players: gameState.players });
}

function handleBecomeMaster(wss: any, id: string, name: string) {
  if (!gameState.master) {
    gameState.master = id;
    gameState.masterName = name;
    gameState.word = "";
    gameState.revealedLetters = "";
    gameState.gameStatus = "playing";
    gameState.clues = [];
    broadcast(wss, { type: "STATE_UPDATE", state: gameState });
  }
}

function handleSetWord(wss: any, id: string, word: string) {
  if (gameState.master === id) {
    gameState.word = word.toUpperCase();
    gameState.revealedLetters = gameState.word[0] || "";
    gameState.gameStatus = "playing";
    broadcast(wss, { type: "STATE_UPDATE", state: gameState });
  }
}

function handleSendClue(wss: any, id: string, text: string, authorWord: string) {
  const player = gameState.players.find(p => p.id === id);
  const hasActiveClue = gameState.clues.some(c => c.status === 'pending' || c.status === 'contacted');
  const isWordBurned = gameState.clues.some(c => c.status === 'blocked' && c.authorWord === authorWord.toUpperCase());
  if (player && gameState.master !== id && !hasActiveClue && !isWordBurned) {
    const newClue = {
      id: Math.random().toString(36).substring(7),
      player: player.name,
      text,
      authorWord: authorWord.toUpperCase(),
      status: 'pending' as const,
      pendingCountdown: 60,
    };
    gameState.clues.push(newClue);
    broadcast(wss, { type: "STATE_UPDATE", state: gameState });

    const pendingTimer = setInterval(() => {
      const currentClue = gameState.clues.find(c => c.id === newClue.id);
      if (!currentClue || currentClue.status !== 'pending') {
        clearInterval(pendingTimer);
        return;
      }

      if (currentClue.pendingCountdown! > 0) {
        currentClue.pendingCountdown!--;
        broadcast(wss, { type: "STATE_UPDATE", state: gameState });
      } else {
        clearInterval(pendingTimer);
        currentClue.status = 'failed';
        broadcast(wss, { type: "STATE_UPDATE", state: gameState });
      }
    }, 1000);
  }
}

function handleContact(wss: any, id: string, clueId: string, guessWord: string) {
  const clue = gameState.clues.find(c => c.id === clueId);
  const contactPlayer = gameState.players.find(p => p.id === id);
  if (clue && clue.status === 'pending' && contactPlayer && clue.player !== contactPlayer.name) {
    clue.status = 'contacted';
    clue.contactPlayer = contactPlayer.name;
    clue.guessWord = guessWord.toUpperCase();
    clue.countdown = 1;
    broadcast(wss, { type: "STATE_UPDATE", state: gameState });

    const timer = setInterval(() => {
      if (clue.status !== 'contacted') {
        clearInterval(timer);
        return;
      }
      if (clue.countdown! > 0) {
        clue.countdown!--;
        broadcast(wss, { type: "STATE_UPDATE", state: gameState });
      } else {
        clearInterval(timer);
        if (clue.authorWord === clue.guessWord) {
          clue.status = 'resolved';
          if (clue.authorWord === gameState.word || gameState.revealedLetters.length + 1 >= gameState.word.length) {
            gameState.revealedLetters = gameState.word;
            gameState.gameStatus = 'won';
          } else {
            if (gameState.revealedLetters.length < gameState.word.length) {
              gameState.revealedLetters = gameState.word.substring(0, gameState.revealedLetters.length + 1);
            }
          }
        } else {
          clue.status = 'failed';
        }
        broadcast(wss, { type: "STATE_UPDATE", state: gameState });
      }
    }, 1000);
  }
}

function handleBlock(wss: any, id: string, clueId: string, masterGuess: string) {
  if (gameState.master === id) {
    const clueToBlock = gameState.clues.find(c => c.id === clueId);
    if (clueToBlock && clueToBlock.status === 'pending') {
      const uMasterGuess = masterGuess.toUpperCase();
      if (uMasterGuess === clueToBlock.authorWord) {
        if (uMasterGuess === gameState.word) {
          clueToBlock.status = 'resolved';
          gameState.revealedLetters = gameState.word;
          gameState.gameStatus = 'won';
        } else {
          clueToBlock.status = 'blocked';
        }
        broadcast(wss, { type: "STATE_UPDATE", state: gameState });
      }
    }
  }
}

function handleChatMessage(wss: any, player: string, text: string) {
  broadcast(wss, { 
    type: "CHAT_MESSAGE", 
    message: {
      id: Math.random().toString(36).substring(7),
      player,
      text,
      timestamp: new Date().toISOString()
    }
  });
}

function handleReset(wss: any) {
  resetGameState(gameState.players);
  broadcast(wss, { type: "STATE_UPDATE", state: gameState });
}

export function handleDisconnect(id: string, wss: any) {
  gameState.players = gameState.players.filter((p) => p.id !== id);
  if (gameState.master === id) {
    gameState.master = null;
    gameState.masterName = "";
    gameState.word = "";
    gameState.revealedLetters = "";
    gameState.gameStatus = "playing";
    gameState.clues = [];
  }
  broadcast(wss, { type: "PLAYER_LEFT", players: gameState.players, master: gameState.master });
}
