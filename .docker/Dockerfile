# syntax=docker/dockerfile:1

FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build frontend
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm", "start"]
