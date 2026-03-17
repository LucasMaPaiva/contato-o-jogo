import WebSocket from 'ws';

const wsMestre = new WebSocket('ws://localhost:3000');
const wsAutor = new WebSocket('ws://localhost:3000');

wsMestre.on('open', () => {
  wsMestre.send(JSON.stringify({ type: 'JOIN', name: 'Mestre' }));
  setTimeout(() => wsMestre.send(JSON.stringify({ type: 'BECOME_MASTER', name: 'Mestre' })), 500);
  setTimeout(() => wsMestre.send(JSON.stringify({ type: 'SET_WORD', word: 'ABACAXI' })), 1000);
});

wsAutor.on('open', () => {
  wsAutor.send(JSON.stringify({ type: 'JOIN', name: 'Autor' }));
  setTimeout(() => {
    wsAutor.send(JSON.stringify({ type: 'SEND_CLUE', text: 'Pista de teste', authorWord: 'MORANGO' }));
  }, 1500);
});

wsMestre.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.type === 'STATE_UPDATE' && msg.state.clues.length > 0) {
     const clue = msg.state.clues[0];
     // Try to block
     if (clue.status === 'pending') {
        console.log("Mestre errando de propósito");
        wsMestre.send(JSON.stringify({ type: 'BLOCK', clueId: clue.id, masterGuess: 'BANANA' }));
        setTimeout(() => {
           console.log("Mestre acertando palavra correta");
           wsMestre.send(JSON.stringify({ type: 'BLOCK', clueId: clue.id, masterGuess: 'MORANGO' }));
        }, 1000);
     } else if (clue.status === 'blocked') {
        console.log("Bloqueio funcionou!");
        process.exit(0);
     }
  }
});

setTimeout(() => {
  console.log("Timeout. Block didn't happen");
  process.exit(1);
}, 5000);
