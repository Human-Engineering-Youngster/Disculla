.PHONY: help install dev build start stop clean lint format \
        frontend-dev frontend-build frontend-start frontend-lint \
        backend-dev backend-build backend-start backend-lint \
        docker-up docker-up-d docker-down docker-build docker-rebuild docker-rebuild-d \
        docker-logs docker-logs-backend docker-logs-frontend docker-logs-postgres \
        tsc check

# ==============================
# Default target
# ==============================
help:
	@echo "利用可能なコマンド:"
	@echo ""
	@echo "■ 基本コマンド"
	@echo "  make install          - 依存関係をインストール"
	@echo "  make dev              - 開発サーバーを起動"
	@echo "  make build            - プロジェクトをビルド"
	@echo "  make start            - 本番環境でアプリを起動"
	@echo "  make lint             - リンターを実行"
	@echo "  make format           - コードフォーマット"
	@echo "  make check            - lint + 型チェック"
	@echo ""
	@echo "■ フロントエンド"
	@echo "  make frontend-dev     - フロントの開発サーバー"
	@echo "  make frontend-build   - フロントをビルド"
	@echo "  make frontend-start   - フロントを本番起動"
	@echo "  make frontend-lint    - フロントのリンター"
	@echo ""
	@echo "■ バックエンド"
	@echo "  make backend-dev      - バックエンドの開発サーバー"
	@echo "  make backend-build    - バックエンドをビルド"
	@echo "  make backend-start    - バックエンド本番起動"
	@echo "  make backend-lint     - バックエンドのリンター"
	@echo ""
	@echo "■ Docker"
	@echo "  make docker-up        - Dockerを起動 (FG)"
	@echo "  make docker-up-d      - Dockerをバックグラウンド起動"
	@echo "  make docker-down      - Docker停止+削除"
	@echo "  make docker-build     - Dockerイメージをビルド"
	@echo "  make docker-rebuild   - イメージ再ビルドして起動"
	@echo "  make docker-rebuild-d - 同上 (バックグラウンド)"
	@echo "  make docker-logs      - 全コンテナのログ"
	@echo "  make docker-logs-backend  - バックエンドログ"
	@echo "  make docker-logs-frontend - フロントエンドログ"
	@echo "  make docker-logs-postgres - Postgresログ"
	@echo ""
	@echo "■ メンテナンス"
	@echo "  make clean            - キャッシュ類の削除(注意: volumes削除あり)"
	@echo "  make stop             - Dockerコンテナ停止"
	@echo "  make tsc              - TypeScript 型チェック"
	@echo ""
	@echo "■ Prisma (Docker内で実行)"
	@echo "  make prisma-generate  - Prisma Clientを生成"
	@echo "  make prisma-migrate   - マイグレーションを実行 (dev)"
	@echo "  make prisma-studio    - Prisma Studioを起動"
	@echo "  make prisma-pull      - DBからスキーマを更新"
	@echo "  make prisma-push      - スキーマをDBに反映 (プロトタイプ用)"

# ------------------------------
# Basic commands
# ------------------------------
install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

start:
	pnpm start

lint:
	pnpm lint

format:
	pnpm format

# ------------------------------
# Frontend
# ------------------------------
frontend-dev:
	pnpm frontend:dev

frontend-build:
	pnpm frontend:build

frontend-start:
	pnpm frontend:start

frontend-lint:
	pnpm frontend:lint

# ------------------------------
# Backend
# ------------------------------
backend-dev:
	pnpm backend:dev

backend-build:
	pnpm backend:build

backend-start:
	pnpm backend:start

backend-lint:
	pnpm backend:lint

# ------------------------------
# Docker
# ------------------------------
docker-up:
	docker-compose up

docker-up-d:
	docker-compose up -d

docker-down:
	docker-compose down

docker-build:
	docker-compose build

docker-rebuild:
	docker-compose up --build

docker-rebuild-d:
	docker-compose up -d --build

docker-logs:
	docker-compose logs -f

docker-logs-backend:
	docker-compose logs -f backend

docker-logs-frontend:
	docker-compose logs -f frontend

docker-logs-postgres:
	docker-compose logs -f postgres

stop:
	docker-compose stop

# ------------------------------
# Maintenance
# ------------------------------
clean:
	rm -rf node_modules
	rm -rf apps/frontend/node_modules
	rm -rf apps/backend/node_modules
	rm -rf apps/frontend/.next
	rm -rf apps/backend/dist
	docker-compose down -v

tsc:
	pnpm --filter frontend tsc
	pnpm --filter backend tsc

check: lint tsc

# ------------------------------
# Prisma (Docker)
# ------------------------------
prisma-generate:
	docker exec disculla-backend npx prisma generate

prisma-migrate:
	docker exec -it disculla-backend npx prisma migrate dev

prisma-studio:
	docker exec -it disculla-backend npx prisma studio --port 5555 --browser none

prisma-pull:
	docker exec disculla-backend npx prisma db pull

prisma-push:
	docker exec disculla-backend npx prisma db push