import { useEffect, useRef, useState } from 'react';
import { GameState, ChatMessage } from '../types/game';

type ConnectPayload =
  | { mode: 'create' }
  | { mode: 'join'; roomCode: string };

type UseGameSocketOptions = {
  onJoined: () => void;
  onDisconnected: () => void;
};

export function useGameSocket(name: string, { onJoined, onDisconnected }: UseGameSocketOptions) {
  const [myId, setMyId] = useState('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [error, setError] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const shouldIgnoreCloseRef = useRef(false);
  const hasJoinedRoomRef = useRef(false);

  const closeSocket = () => {
    if (ws) {
      shouldIgnoreCloseRef.current = true;
      ws.close();
      setWs(null);
    }
  };

  useEffect(() => {
    return () => {
      shouldIgnoreCloseRef.current = true;
      ws?.close();
    };
  }, [ws]);

  const connectToRoom = (payload: ConnectPayload) => {
    closeSocket();
    setError('');
    setGameState(null);
    setChatMessages([]);
    setMyId('');
    setIsConnecting(true);
    hasJoinedRoomRef.current = false;

    const apiUrl = import.meta.env.VITE_API_URL || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
    const socket = new WebSocket(apiUrl);

    socket.onopen = () => {
      if (payload.mode === 'create') {
        socket.send(JSON.stringify({ type: 'CREATE_ROOM', name }));
        return;
      }

      socket.send(JSON.stringify({ type: 'JOIN_ROOM', name, roomCode: payload.roomCode }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'INIT':
          hasJoinedRoomRef.current = true;
          setMyId(data.id);
          setGameState(data.state);
          setChatMessages([]);
          setError('');
          setIsConnecting(false);
          onJoined();
          break;
        case 'ERROR':
          setError(data.message);
          setIsConnecting(false);
          shouldIgnoreCloseRef.current = true;
          socket.close();
          setWs(null);
          break;
        case 'STATE_UPDATE':
          setGameState(data.state);
          break;
        case 'PLAYER_JOINED':
        case 'PLAYER_LEFT':
          setGameState(data.state);
          break;
        case 'CHAT_MESSAGE':
          setChatMessages(prev => [...prev, data.message]);
          break;
      }
    };

    socket.onclose = () => {
      const shouldIgnoreClose = shouldIgnoreCloseRef.current;
      shouldIgnoreCloseRef.current = false;
      setWs(current => (current === socket ? null : current));
      setIsConnecting(false);

      if (shouldIgnoreClose) {
        return;
      }

      if (hasJoinedRoomRef.current) {
        hasJoinedRoomRef.current = false;
        setGameState(null);
        setMyId('');
        setChatMessages([]);
        setError('Conexao perdida. Tente entrar novamente.');
        onDisconnected();
      }
    };

    setWs(socket);
  };

  const sendAction = (type: string, payload: any = {}) => {
    ws?.send(JSON.stringify({ type, ...payload }));
  };

  const leaveRoom = () => {
    hasJoinedRoomRef.current = false;
    setGameState(null);
    setMyId('');
    setChatMessages([]);
    setError('');
    closeSocket();
  };

  return { myId, gameState, ws, error, setError, chatMessages, sendAction, connectToRoom, leaveRoom, isConnecting };
}
