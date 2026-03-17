import { WebSocket } from "ws";
import { GameState } from "./types";

export let gameState: GameState = {
  master: null,
  masterName: "",
  word: "",
  revealedLetters: "",
  gameStatus: "playing",
  players: [],
  clues: [],
};

export function resetGameState(players: any[]) {
  gameState = {
    master: null,
    masterName: "",
    word: "",
    revealedLetters: "",
    gameStatus: "playing",
    players,
    clues: [],
  };
}

export function broadcast(wss: any, data: any) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client: any) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
