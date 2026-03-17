.PHONY: install up down logs

COMPOSE_PROJECT_NAME := h7-escalas
COMPOSE := docker compose -f .docker/docker-compose.yml -p $(COMPOSE_PROJECT_NAME) --env-file .env.local

install: up

up:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f
