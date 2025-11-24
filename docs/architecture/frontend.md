# フロントエンドアーキテクチャ

## Feature-based Architecture（Next.js App Router）

## 概要

このフロントエンドは **Feature-based Architecture** を採用しており、「ページ単位」ではなく **ドメイン（機能）単位で責務を整理する構成** になっています。

Next.js App Router が提供する `app/` ディレクトリ構造を活用しつつ、UI コンポーネント・ユースケース・スキーマ・サービスなどを **features/** に集約することで、スケールしても破綻しにくい拡張性の高い設計になっています。

### 特徴

- **app/** - ルーティング・画面単位の構成
- **features/** - ビジネスロジックと UI を集約（1機能＝1フォルダ）
- **shared/** - 全機能共通の UI / ロジックを配置し再利用性を向上
- 独立性の高い機能構成のため、新規機能追加が容易

---

## ディレクトリ構造

```txt
src/
├── app                                # ルーティング・画面構成
│   ├── (private)                      # 認証必須ページ
│   │   └── xx
│   │
│   ├── (public)                       # 公開ページ
│   │   └── auth
│   │       ├── layout.tsx
│   │       ├── register
│   │       └── login
│   │
│   ├── api                             # Route Handlers（Next.js Server Actions/API）
│   │   └── v1
│   │       └── xx(複数系)
│   │           └── [id]
│   │               └── route.ts
│   │
│   ├── not-found.tsx
│   ├── error.tsx
│   ├── favicon.ico
│   ├── globals.css
│   └── layout.tsx
│
├── features                            # Feature（機能）単位のディレクトリ
│   └── xx                              # 任意の機能（例：user、task）
│       ├── components                  # UIコンポーネント
│       │   ├── XxCard.tsx
│       │   ├── XxForm.tsx
│       │   └── XxList.tsx
│       │
│       ├── constants                   # 機能固有の定数
│       │   ├── index.ts
│       │   ├── xx.ts
│       │   └── xxDefaultValues.ts
│       │
│       ├── hooks                       # React Hooks
│       │   ├── index.ts
│       │   └── useXx.ts
│       │
│       ├── schemas                     # Zod スキーマ
│       │   ├── index.ts
│       │   └── xx.ts
│       │
│       ├── usecases                    # ビジネスユースケース（UI と API の中間）
│       │   ├── index.ts
│       │   └── xxUsecase.ts
│       │
│       ├── services                    # API通信・外部サービス層
│       │   ├── index.ts
│       │   └── xxService.ts
│       │
│       └── types                       # 型定義
│           ├── index.ts
│           └── Xx.ts
│
├── middleware.ts
│
└── shared                              # 全機能で使う共通実装
    ├── components                      # UI 共通パーツ
    │   ├── button.ts
    │   ├── xx.ts
    │   └── card.ts
    │
    ├── constants                       # グローバル定数
    │   └── xx.ts
    │
    ├── lib                             # 共通関数・ユーティリティ類
    │   ├── xx.ts
    │   ├── customFetch.ts
    │   ├── env
    │   │   ├── index.ts
    │   │   ├── loader.ts
    │   │   └── server.ts
    │   └── utils.ts
    │
    └── types                           # 共通型定義
        └── xx.ts
```

---

## 各レイヤーの責務

### 1. app/（ルート・画面）

- ルーティングの定義
- ページ UI の骨組み
- Server Actions や Route Handlers のエントリポイント

### 2. features/（機能レイヤー）

1つの機能を丸ごと閉じ込めるフォルダ構成。以下の役割を含む：

| ディレクトリ | 役割                                 |
| ------------ | ------------------------------------ |
| components/  | 機能固有の UI                        |
| schemas/     | 入力バリデーション（zod）            |
| services/    | API 通信（fetch wrapper）            |
| usecases/    | ビジネスロジック（非同期処理の整理） |
| hooks/       | UI 用ロジック                        |
| constants/   | 機能ごとの定数・初期値               |
| types/       | 型定義                               |

Next.js の Fat Page 問題を避け、責務の分散と保守性向上を実現。

### 3. shared/（共通レイヤー）

- 全機能で使う UI コンポーネント
- 環境変数 loader
- fetch wrapper
- util 関数
- 共通 types

### 4. api/（Next.js Route Handler）

- fetch クライアントから利用される API
- 認証やミドルウェアと連携
