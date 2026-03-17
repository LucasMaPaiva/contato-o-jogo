import WebSocket from 'ws';

const ws1 = new WebSocket('ws://localhost:3000');
const ws2 = new WebSocket('ws://localhost:3000');

ws1.on('open', () => {
  ws1.send(JSON.stringify({ type: 'JOIN', name: 'Original' }));
  
  setTimeout(() => {
    ws2.send(JSON.stringify({ type: 'JOIN', name: 'Original' }));
  }, 500);
});

ws2.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.type === 'ERROR') {
    console.log('Received expected error:', msg.message);
    if (msg.message === "Nome de usuário já está em uso.") {
      console.log('SUCCESS');
      process.exit(0);
    } else {
      console.log('FAILED: wrong error message');
      process.exit(1);
    }
  }
});

setTimeout(() => {
  console.log('Timeout - No error received');
  process.exit(1);
}, 3000);
