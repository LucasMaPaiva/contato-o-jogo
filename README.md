# 🎮 Contato - O Jogo

**Um jogo cooperativo de adivinhação em tempo real.**
</div>

---

## 📝 Sobre o Projeto

O **Contato** é uma implementação digital do clássico jogo de palavras de mesmo nome. É um jogo que desafia a agilidade mental, o vocabulário e a sincronia entre os jogadores. Esta versão foi construída para oferecer uma experiência fluida, moderna e totalmente em tempo real.

## 🕹️ Como Jogar

O jogo divide os participantes em dois papéis: o **Mestre** e os **Adivinhadores**.

### 👑 O Mestre
1. O Mestre escolhe uma **Palavra Secreta**.
2. O objetivo do Mestre é evitar que os Adivinhadores descubram a palavra.
3. Ele pode **Bloquear** as pistas dos jogadores se conseguir adivinhar a palavra da pista antes do "Contato".

### 💡 Os Adivinhadores
1. Devem sugerir palavras-pista que **começam com as mesmas letras já reveladas** da Palavra Secreta.
2. Exemplo: Se a palavra é `AMIZADE` e apenas `A` foi revelado, um jogador pode dar a pista "Fruta ácida e amarela" (referindo-se a `ABACAXI`).

### 🔥 O "Contato!"
- Quando outro adivinhador acha que sabe a resposta para uma pista, ele clica em **CONTATO**!
- Uma contagem regressiva de 1 segundo se inicia.
- Se ambos (autor da pista e quem deu contato) estiverem pensando na mesma palavra, o Mestre é forçado a revelar **mais uma letra** da Palavra Secreta.
- Se o Mestre adivinhar a palavra da pista antes do contato terminar, ele clica em **QUEBRAR** e a pista é anulada.

---

## 🚀 Tecnologias Utilizadas

Este projeto utiliza uma stack moderna e performática:

- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend**: [Node.js](https://nodejs.org/) com [Express](https://expressjs.com/)
- **Real-time**: [WebSockets (ws)](https://github.com/websockets/ws)
- **Animações**: [Framer Motion](https://www.framer.com/motion/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)

---

## 🛠️ Configuração e Instalação

### Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn

### Passo a Passo

1. **Clonar o repositório**
   ```bash
   git clone [url-do-repositorio]
   cd contato-o-jogo
   ```

2. **Instalar dependências**
   ```bash
   npm install
   ```

3. **Configuração de Ambiente**
   Crie um arquivo `.env.local` na raiz do projeto (ou use o `.env.example` como base):
   ```bash
   GEMINI_API_KEY="sua_chave_aqui"
   ```
   *Nota: A chave Gemini é necessária para futuras integrações de IA no jogo.*

4. **Rodar em modo de desenvolvimento**
   ```bash
   npm run dev
   ```
   O servidor iniciará em `http://localhost:3000`.

---

## 📂 Estrutura do Projeto

- `/src`: Contém todo o código do React (componentes, hooks, estilos).
- `/server`: Implementação do servidor Express e lógica dos WebSockets.
- `/public`: Ativos estáticos.

---

<div align="center">
Desenvolvido com ❤️ para amantes de jogos de palavras.
</div>
