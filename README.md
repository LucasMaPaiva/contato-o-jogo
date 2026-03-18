# Contato - O Jogo 🎮

Este é o frontend do jogo **Contato**, desenvolvido em React com TypeScript e Vite. Agora ele opera de forma totalmente independente da API e é servido via **Nginx** em ambiente de produção (Docker).

## 🚀 Tecnologias

- **Framework**: React / Vite
- **Linguagem**: TypeScript
- **Estilização**: CSS Modules / Lucide React (Ícones)
- **Servidor de Produção**: Nginx (Build multi-stage)
- **Infraestrutura**: Docker & Docker Compose

## 🏗️ Estrutura do Projeto

- **`src/components/`**: Componentes reutilizáveis da interface.
- **`src/hooks/`**: Hooks customizados (incluindo o `useGameSocket`).
- **`src/types/`**: Definições de tipos para o domínio do jogo.
- **`.docker/`**: Arquivos de configuração do Docker e Nginx.

## ⚙️ Configuração (Ambiente)

O frontend utiliza variáveis de ambiente para se conectar à API. Crie um arquivo `.env` na raiz:

```env
VITE_API_URL=wss://api.contato-o-jogo.site
```

> [!IMPORTANT]
> Em produção com HTTPS, utilize sempre o protocolo `wss://`.

## 📦 Como Rodar

### Desenvolvimento Local (Node)
```bash
npm install
npm run dev
```

### Produção (Docker + Nginx)
Utilize o **Makefile** para gerenciar o container:

```bash
# Iniciar o frontend via Nginx
make up

# Ver logs do Nginx
make logs

# Parar o serviço
make down
```

> [!TIP]
> O fluxo usa perfis do Docker Compose. Defina `PROFILE` (`local`, `dev`, `hml` ou `prod`) no `.env` ou diretamente no comando:
> ```bash
> PROFILE=prod make up   # conecta no proxy manager (rede externa)
> PROFILE=local make up  # usa apenas a rede padrão local
> ```

## 🔐 Segurança e HTTPS

Este projeto foi desenhado para rodar atrás de um **Proxy Reverso** (ex: Nginx Proxy Manager). O Dockerfile utiliza uma build multi-stage que gera os arquivos estáticos e os serve através de um servidor Nginx otimizado, configurado para suportar roteamento de SPA (Single Page Application).

---
Desenvolvido por Antigravity 🤖
