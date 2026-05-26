.PHONY: up down logs ps config backend-shell frontend-shell health overview funnel metadata lint-frontend build-frontend

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

ps:
	docker compose ps

config:
	docker compose config
	docker compose config --environment

backend-shell:
	docker compose exec backend sh

frontend-shell:
	docker compose exec frontend sh

health:
	curl -s http://localhost:8000/health | jq

overview:
	curl -s 'http://localhost:8000/api/overview?start=2020-11-01&end=2021-01-31' | jq

funnel:
	curl -s 'http://localhost:8000/api/funnel?start=2020-11-01&end=2021-01-31' | jq

metadata:
	curl -s http://localhost:8000/api/metadata/source | jq
	curl -s http://localhost:8000/api/definitions/metrics | jq

lint-frontend:
	docker compose exec frontend sh -c "cd /app/frontend && npm run lint"

build-frontend:
	docker compose exec frontend sh -c "cd /app/frontend && npm run build"
