import { useState, useEffect } from 'react';
import { GameState, ChatMessage } from '../types/game';

export function useGameSocket(name: string, isJoined: boolean, setIsJoined: (v: boolean) => void) {
  const [myId, setMyId] = useState('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [error, setError] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

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
