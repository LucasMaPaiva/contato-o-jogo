import WebSocket from 'ws';

const ws1 = new WebSocket('ws://localhost:3000');
const ws2 = new WebSocket('ws://localhost:3000');
let msgsReceived = 0;

ws1.on('open', () => {
  ws1.send(JSON.stringify({ type: 'JOIN', name: 'Alice' }));
  setTimeout(() => {
    ws1.send(JSON.stringify({ type: 'CHAT_MESSAGE', player: 'Alice', text: 'Hello Bob!' }));
  }, 500);
});

ws2.on('open', () => {
  ws2.send(JSON.stringify({ type: 'JOIN', name: 'Bob' }));
});

ws2.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.type === 'CHAT_MESSAGE') {
     console.log(`Bob received: ${msg.message.player} says "${msg.message.text}"`);
     msgsReceived++;
     if (msgsReceived === 1) {
        console.log("SUCCESS");
        process.exit(0);
     }
  }
});

setTimeout(() => {
  console.log("Timeout");
  process.exit(1);
}, 2000);
