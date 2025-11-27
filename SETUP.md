# 開発環境セットアップ手順

## 前提条件

- **Docker Desktop** がインストールされ、起動していること。
- **Node.js** (v20以上推奨) と **pnpm** がインストールされていること。

## 環境変数の設定

frontendとbackend各アプリケーションディレクトリにある `.env.example` をコピーして `.env` ファイルを作成してください。

### Root (`.`)

PostgreSQLの接続情報（ユーザー、パスワード、DB名）を設定します。

```bash
cp db/.env.example db/.env
```

### Backend (`apps/backend`)

**ローカル開発用 (`.env`)**

```bash
cp apps/backend/.env.example apps/backend/.env
```

※ `DATABASE_URL` は `localhost` を指すように設定してください（デフォルトで設定済み）。

**Docker用 (`.env.docker`)**

```bash
cp apps/backend/.env.example apps/backend/.env.docker
```

※ `DATABASE_URL` は `postgres` ホストを指すように設定してください。

```env
DATABASE_URL=postgres://user:password@postgres:5432/disculla
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
※ DBのみDockerで起動しておく必要があります。

1.  DBの起動

    ```bash
    docker compose up postgres -d
    ```

2.  依存パッケージのインストール

    ```bash
    pnpm install
    ```

3.  アプリケーションの起動（ルートディレクトリ）
    ```bash
    pnpm run dev
    ```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
