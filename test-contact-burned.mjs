import WebSocket from 'ws';

const wsMestre = new WebSocket('ws://localhost:3000');
const wsAutor = new WebSocket('ws://localhost:3000');

let attempt = 1;

wsMestre.on('open', () => {
  wsMestre.send(JSON.stringify({ type: 'JOIN', name: 'Mestre' }));
  setTimeout(() => wsMestre.send(JSON.stringify({ type: 'BECOME_MASTER', name: 'Mestre' })), 500);
  setTimeout(() => wsMestre.send(JSON.stringify({ type: 'SET_WORD', word: 'ABACAXI' })), 1000);
});

wsAutor.on('open', () => {
  wsAutor.send(JSON.stringify({ type: 'JOIN', name: 'Autor' }));
  setTimeout(() => {
    wsAutor.send(JSON.stringify({ type: 'SEND_CLUE', text: 'Pista 1', authorWord: 'UM' }));
  }, 1500);
});

wsAutor.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.type === 'STATE_UPDATE' && msg.state.clues.length > 0) {
     const clue = msg.state.clues[0];
     // Try to block
     if (clue.status === 'pending' && attempt === 1) {
        attempt = 2;
        wsMestre.send(JSON.stringify({ type: 'BLOCK', clueId: clue.id, masterGuess: 'UM' }));
     } else if (clue.status === 'blocked' && attempt === 2) {
        attempt = 3;
        console.log("Pista 1 Bloqueada. Tentando mandar outra com a MESMA palavra QUEIMADA.");
        wsAutor.send(JSON.stringify({ type: 'SEND_CLUE', text: 'Pista 2 pirata', authorWord: 'UM' }));
        setTimeout(() => {
          if (msg.state.clues.length === 1) {
            console.log("SUCCESS: Palavra queimada foi rejeitada pelo backend!");
            process.exit(0);
          } else {
            console.log("FAILED: Palavra queimada foi aceita!");
            process.exit(1);
          }
        }, 1000);
     }
  }
});

setTimeout(() => {
  console.log("Timeout.");
  process.exit(1);
}, 5000);
