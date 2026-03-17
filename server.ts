import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  const PORT = 3000;

  // Game State
  let gameState = {
    master: null as string | null, // socket id
    masterName: "",
    word: "",
    revealedLetters: "",
    gameStatus: "playing" as "playing" | "won",
    players: [] as { id: string; name: string }[],
    clues: [] as { 
      id: string; 
      player: string; 
      text: string; 
      authorWord: string;
      status: 'pending' | 'contacted' | 'blocked' | 'resolved' | 'failed'; 
      contactPlayer?: string; 
      guessWord?: string;
      countdown?: number;
    }[],
  };

  function broadcast(data: any) {
    const message = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  wss.on("connection", (ws, req) => {
    const id = Math.random().toString(36).substring(7);
    console.log(`New connection: ${id}`);

    ws.on("message", (message) => {
      const data = JSON.parse(message.toString());

      switch (data.type) {
        case "JOIN":
          gameState.players.push({ id, name: data.name });
          ws.send(JSON.stringify({ type: "INIT", id, state: gameState }));
          broadcast({ type: "PLAYER_JOINED", players: gameState.players });
          break;

        case "BECOME_MASTER":
          if (!gameState.master) {
            gameState.master = id;
            gameState.masterName = data.name;
            gameState.word = "";
            gameState.revealedLetters = "";
            gameState.gameStatus = "playing";
            gameState.clues = [];
            broadcast({ type: "STATE_UPDATE", state: gameState });
          }
          break;

        case "SET_WORD":
          if (gameState.master === id) {
            gameState.word = data.word.toUpperCase();
            gameState.revealedLetters = gameState.word[0];
            gameState.gameStatus = "playing";
            broadcast({ type: "STATE_UPDATE", state: gameState });
          }
          break;

        case "SEND_CLUE":
          const player = gameState.players.find(p => p.id === id);
          const hasActiveClue = gameState.clues.some(c => c.status === 'pending' || c.status === 'contacted');
          const isWordBurned = gameState.clues.some(c => c.status === 'blocked' && c.authorWord === data.authorWord.toUpperCase());
          if (player && gameState.master !== id && !hasActiveClue && !isWordBurned) {
            const newClue = {
              id: Math.random().toString(36).substring(7),
              player: player.name,
              text: data.text,
              authorWord: data.authorWord.toUpperCase(),
              status: 'pending' as const,
            };
            gameState.clues.push(newClue);
            broadcast({ type: "STATE_UPDATE", state: gameState });
          }
          break;

        case "CONTACT":
          const clue = gameState.clues.find(c => c.id === data.clueId);
          const contactPlayer = gameState.players.find(p => p.id === id);
          if (clue && clue.status === 'pending' && contactPlayer && clue.player !== contactPlayer.name) {
            clue.status = 'contacted';
            clue.contactPlayer = contactPlayer.name;
            clue.guessWord = data.guessWord.toUpperCase();
            clue.countdown = 5;
            broadcast({ type: "STATE_UPDATE", state: gameState });

            // Start countdown
            const timer = setInterval(() => {
              if (clue.status !== 'contacted') {
                clearInterval(timer);
                return;
              }
              if (clue.countdown! > 0) {
                clue.countdown!--;
                broadcast({ type: "STATE_UPDATE", state: gameState });
              } else {
                clearInterval(timer);
                
                // Compare the words
                if (clue.authorWord === clue.guessWord) {
                  clue.status = 'resolved';
                  
                  // Check win condition (word guessed directly or full word revealed)
                  if (clue.authorWord === gameState.word || gameState.revealedLetters.length + 1 >= gameState.word.length) {
                     gameState.revealedLetters = gameState.word;
                     gameState.gameStatus = 'won';
                  } else {
                    // Reveal next letter
                    if (gameState.revealedLetters.length < gameState.word.length) {
                      gameState.revealedLetters = gameState.word.substring(0, gameState.revealedLetters.length + 1);
                    }
                  }
                } else {
                  clue.status = 'failed';
                }
                
                broadcast({ type: "STATE_UPDATE", state: gameState });
              }
            }, 1000);
          }
          break;

        case "BLOCK":
          if (gameState.master === id) {
            const clueToBlock = gameState.clues.find(c => c.id === data.clueId);
            if (clueToBlock && (clueToBlock.status === 'pending' || clueToBlock.status === 'contacted')) {
              const masterGuess = data.masterGuess.toUpperCase();
              
              if (masterGuess === clueToBlock.authorWord) {
                if (masterGuess === gameState.word) {
                  // Mestre tentou bloquear a própria palavra e acertou a pista! Eles ganham.
                  clueToBlock.status = 'resolved';
                  gameState.revealedLetters = gameState.word;
                  gameState.gameStatus = 'won';
                  broadcast({ type: "STATE_UPDATE", state: gameState });
                } else {
                  // Mestre bloqueou uma palavra normal com sucesso.
                  clueToBlock.status = 'blocked';
                  broadcast({ type: "STATE_UPDATE", state: gameState });
                }
              }
              // Se errar a palavra, nada acontece na tela (o master pode ver visualmente no app, mas pro server a pista segue viva)
            }
          }
          break;

        case "RESET":
          gameState = {
            master: null,
            masterName: "",
            word: "",
            revealedLetters: "",
            gameStatus: "playing",
            players: gameState.players,
            clues: [],
          };
          broadcast({ type: "STATE_UPDATE", state: gameState });
          break;
      }
    });

    ws.on("close", () => {
      gameState.players = gameState.players.filter((p) => p.id !== id);
      if (gameState.master === id) {
        gameState.master = null;
        gameState.masterName = "";
        gameState.word = "";
        gameState.revealedLetters = "";
        gameState.gameStatus = "playing";
        gameState.clues = [];
      }
      broadcast({ type: "PLAYER_LEFT", players: gameState.players, master: gameState.master });
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
