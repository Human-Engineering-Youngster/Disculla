# 開発環境セットアップ手順

## 前提条件

- **Docker Desktop** がインストールされ、起動していること。
- **Node.js** (v20以上推奨) と **pnpm** がインストールされていること。

## 環境変数の設定

プロジェクトルートに `.env` ファイルを作成してください（必要に応じて `.env.example` をコピー）。
**Neon DB** を使用するため、`DATABASE_URL` には Neon の接続文字列を設定してください。

```env
# Backend
PORT=3001
ORIGIN=http://localhost:3000
DATABASE_URL=postgres://[user]:[password]@[host]/[dbname]?sslmode=require

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Docker での起動（推奨）

以下のコマンドで、Backend, Frontend のサービスを起動します。

```bash
docker-compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

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
