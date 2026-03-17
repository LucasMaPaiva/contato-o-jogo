import WebSocket from 'ws';

const wsMestre = new WebSocket('ws://localhost:3000');
const wsAutor = new WebSocket('ws://localhost:3000');
const wsAdivinhador = new WebSocket('ws://localhost:3000');

let attempt = 1;

wsMestre.on('open', () => {
  wsMestre.send(JSON.stringify({ type: 'JOIN', name: 'Mestre' }));
  setTimeout(() => wsMestre.send(JSON.stringify({ type: 'BECOME_MASTER', name: 'Mestre' })), 500);
  setTimeout(() => wsMestre.send(JSON.stringify({ type: 'SET_WORD', word: 'ABACAXI' })), 1000);
});

wsAutor.on('open', () => {
  wsAutor.send(JSON.stringify({ type: 'JOIN', name: 'Autor' }));
  setTimeout(() => {
    console.log("Autor enviando pista: Uma fruta com coroa (A resposta é a palavra secreta!)");
    wsAutor.send(JSON.stringify({ type: 'SEND_CLUE', text: 'Fruta com coroa', authorWord: 'ABACAXI' }));
  }, 1500);
});

wsAdivinhador.on('open', () => {
  wsAdivinhador.send(JSON.stringify({ type: 'JOIN', name: 'Adivinhador' }));
});

wsAdivinhador.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.type === 'STATE_UPDATE' && msg.state.clues.length > 0) {
    const clue = msg.state.clues[msg.state.clues.length - 1]; // pega a ultima
    
    if (clue.status === 'pending' && attempt === 1) {
      console.log("Adivinhador tentando contato com ABACAXI");
      attempt = 2; // block reinvokes
      wsAdivinhador.send(JSON.stringify({ type: 'CONTACT', clueId: clue.id, guessWord: 'ABACAXI' }));
    } 
    else if (clue.status === 'resolved' && attempt === 2) {
       console.log("Contato resolvido!");
       console.log("Letras reveladas:", msg.state.revealedLetters);
       console.log("Status final:", msg.state.gameStatus);
       if (msg.state.revealedLetters === 'ABACAXI' && msg.state.gameStatus === 'won') {
         console.log("SUCCESS");
         process.exit(0);
       } else {
         console.log("Falhou na vitoria global");
         process.exit(1);
       }
    }
  }
});

setTimeout(() => {
  console.log("Timeout");
  process.exit(1);
}, 10000);
