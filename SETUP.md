# 開発環境セットアップ手順

## 前提条件

- **Docker Desktop** がインストールされ、起動していること。
- **Node.js** (v20以上推奨) と **pnpm** がインストールされていること。

## 環境変数の設定

frontendとbackendにある `.env.example` をコピーして `.env` ファイルを作成してください。

### Backend (`apps/backend`)

```bash
cp apps/backend/.env.example apps/backend/.env
```

**重要**: `apps/backend/.env` に **Neon DB** の接続情報を追記してください。

```env
DATABASE_URL=postgres://[user]:[password]@[host]/[dbname]?sslmode=require
```

### Frontend (`apps/frontend`)

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

## Docker での起動（推奨）

以下のコマンドで、Backend, Frontend のサービスを起動します。

```bash
docker compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080

ホットリロードが有効になっているため、ソースコードを編集すると自動的に反映されます。

## ローカルでの起動（Dockerなし）

Dockerを使用せず、ホストマシンで直接実行する場合の手順です。

1.  依存パッケージのインストール

    ```bash
    pnpm install
    ```

2.  Backend の起動

    ```bash
    pnpm backend:dev
    ```

3.  Frontend の起動
    ```bash
    pnpm frontend:dev
    ```
