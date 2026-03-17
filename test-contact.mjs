import WebSocket from 'ws';

const wsMestre = new WebSocket('ws://localhost:3000');
const wsAutor = new WebSocket('ws://localhost:3000');
const wsAdivinhador = new WebSocket('ws://localhost:3000');

let idToContact = '';
let attempt = 1;

wsMestre.on('open', () => {
  wsMestre.send(JSON.stringify({ type: 'JOIN', name: 'Mestre' }));
  setTimeout(() => wsMestre.send(JSON.stringify({ type: 'BECOME_MASTER', name: 'Mestre' })), 500);
  setTimeout(() => wsMestre.send(JSON.stringify({ type: 'SET_WORD', word: 'ABACAXI' })), 1000);
});

wsAutor.on('open', () => {
  wsAutor.send(JSON.stringify({ type: 'JOIN', name: 'Autor' }));
  setTimeout(() => {
    console.log("Autor enviando pista: Fruta amarela / AMARELA");
    wsAutor.send(JSON.stringify({ type: 'SEND_CLUE', text: 'Fruta amarela', authorWord: 'AMARELA' }));
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
      console.log("Adivinhador tentando contato com AMORA (errado)");
      idToContact = clue.id;
      attempt = 2; // block reinvokes
      wsAdivinhador.send(JSON.stringify({ type: 'CONTACT', clueId: clue.id, guessWord: 'AMORA' }));
    } 
    else if (clue.status === 'failed' && attempt === 2) {
       console.log("Contato falhou corretamente! Tentando dnv com acerto...");
       attempt = 3;
       wsAutor.send(JSON.stringify({ type: 'SEND_CLUE', text: 'Fruta amarela', authorWord: 'AMARELA' }));
    } 
    else if (clue.status === 'pending' && attempt === 3) {
       console.log("Adivinhador tentando contato com AMARELA (certo)");
       attempt = 4;
       wsAdivinhador.send(JSON.stringify({ type: 'CONTACT', clueId: clue.id, guessWord: 'AMARELA' }));
    } 
    else if (clue.status === 'resolved' && attempt === 4) {
       console.log("Contato resolvido corretamente!");
       console.log("Letras reveladas:", msg.state.revealedLetters);
       if (msg.state.revealedLetters === 'AB') {
         console.log("SUCCESS");
         process.exit(0);
       } else {
         console.log("Letras incorretas", msg.state.revealedLetters);
         process.exit(1);
       }
    }
  }
});

setTimeout(() => {
  console.log("Timeout");
  process.exit(1);
}, 15000);
