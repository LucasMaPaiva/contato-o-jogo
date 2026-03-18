import { useState, useEffect } from 'react';
import { GameState, ChatMessage } from '../types/game';

/**
 * Custom hook to manage the WebSocket connection and game state.
 * Handles automatic connection, message parsing, and provides methods to send actions.
 * 
 * @param name - The player's chosen name.
 * @param isJoined - Boolean flag indicating if the player has attempted to join.
 * @param setIsJoined - State setter to update the join status (e.g., on error or disconnect).
 * @returns An object containing the player's ID, current game state, socket instance, error messages, and a sendAction method.
 */
export function useGameSocket(name: string, isJoined: boolean, setIsJoined: (v: boolean) => void) {
  const [myId, setMyId] = useState('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [error, setError] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (isJoined) {
      const apiUrl = import.meta.env.VITE_API_URL || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
      console.log("Connecting to WebSocket:", apiUrl);
      const socket = new WebSocket(apiUrl);

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
          case 'ERROR':
            setError(data.message);
            if (data.message === "Nome de usuário já está em uso.") {
              setIsJoined(false);
              setWs(null);
            }
            break;
          case 'STATE_UPDATE':
            setGameState(data.state);
            break;
          case 'PLAYER_JOINED':
          case 'PLAYER_LEFT':
            setGameState(prev => prev ? { ...prev, players: data.players, master: data.master ?? prev.master } : null);
            break;
          case 'CHAT_MESSAGE':
            setChatMessages(prev => [...prev, data.message]);
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
  }, [isJoined, name, setIsJoined]);

  const sendAction = (type: string, payload: any = {}) => {
    ws?.send(JSON.stringify({ type, ...payload }));
  };

  return { myId, gameState, ws, error, setError, chatMessages, sendAction };
}
