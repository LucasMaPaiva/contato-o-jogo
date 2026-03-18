# Arquitetura do Sistema - Contato

Este documento descreve a arquitetura técnica, o fluxo de dados e os protocolos utilizados no jogo **Contato**.

## 🏗️ Visão Geral
O sistema segue um modelo **Cliente-Servidor** utilizando **WebSockets** para sincronização de estado em tempo real. O servidor é a "fonte da verdade", gerenciando o estado do jogo e distribuindo atualizações para todos os clientes conectados.

---

## 💻 Frontend (React)

A interface é construída com **React 19** e utiliza uma abordagem funcional com hooks.

### Fluxo de Dados
1. **Conexão**: Ao entrar no jogo, o cliente estabelece uma conexão WebSocket via o hook `useGameSocket`.
2. **Estado**: O estado do jogo (`GameState`) é recebido do servidor e armazenado localmente no hook.
3. **Ações**: Interações do usuário (enviar pista, dar contato, etc.) são enviadas como mensagens JSON para o servidor.

### Componentes Principais
- `App.tsx`: Gerenciador principal de layout e roteamento entre telas (Join vs Game).
- `useGameSocket.ts`: Encapsula toda a lógica de comunicação WebSocket, tratamento de mensagens e reconexão.
- `ClueSection.tsx`: Gerencia a exibição e interação com as pistas ativas.
- `MasterPanel.tsx`: Interface exclusiva para o Mestre definir a palavra e gerenciar o jogo.

---

## 🖥️ Backend (Node.js/Express)

O servidor utiliza **Express** para servir os arquivos estáticos e **ws** para o gerenciamento de WebSockets.

### Gerenciamento de Estado (`server/game-state.ts`)
O estado do jogo é mantido em memória no servidor:
- Lista de jogadores ativos.
- Palavra secreta (e letras reveladas).
- Pistas pendentes, ativas e resolvidas.
- Status atual da partida (`playing`, `won`).

### Processamento de Mensagens (`server/socket-handlers.ts`)
O servidor processa ações dos clientes através de um sistema de handlers:
- `JOIN`: Adiciona um novo jogador e envia o estado inicial.
- `SET_WORD`: Define a palavra secreta (apenas Mestre).
- `SEND_CLUE`: Valida e adiciona uma nova pista.
- `CONTACT`: Inicia o processo de verificação de uma pista.
- `BLOCK`: Permite ao mestre tentar quebrar uma pista.

---

## 🔄 Protocolo WebSocket

As mensagens trocadas seguem o formato `{ type: string, ...payload }`.

### Mensagens do Cliente para o Servidor
- `JOIN`: `{ name: string }`
- `BECOME_MASTER`: `{ name: string }`
- `SET_WORD`: `{ word: string }`
- `SEND_CLUE`: `{ text: string, authorWord: string }`
- `CONTACT`: `{ clueId: string, guessWord: string }`
- `BLOCK`: `{ clueId: string, masterGuess: string }`
- `RESET`: `{}`

### Mensagens do Servidor para o Cliente
- `INIT`: Envia o ID do jogador e o estado completo do jogo após o JOIN.
- `STATE_UPDATE`: Envia o estado completo atualizado após qualquer mudança significativa.
- `CHAT_MESSAGE`: Encaminha mensagens de chat para todos os jogadores.
- `ERROR`: Notifica erros específicos (ex: nome de usuário duplicado).
