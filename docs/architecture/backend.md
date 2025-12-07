# Disculla バックエンドアーキテクチャドキュメント

## 目次

1. [アーキテクチャ概要](#アーキテクチャ概要)
2. [採用アーキテクチャの選定理由](#採用アーキテクチャの選定理由)
3. [ディレクトリ構造](#ディレクトリ構造)
4. [各レイヤーの詳細](#各レイヤーの詳細)
5. [実装ガイドライン](#実装ガイドライン)
6. [コーディング規約とベストプラクティス](#コーディング規約とベストプラクティス)

---

## アーキテクチャ概要

### 採用アーキテクチャ: **クリーンアーキテクチャ (Clean Architecture)**

本プロジェクトは、Robert C. Martin (Uncle Bob) によって提唱された**クリーンアーキテクチャ**を基盤としたレイヤードアーキテクチャを採用しています。NestJSの強力なDI(Dependency Injection)コンテナとモジュールシステムを活用し、依存性逆転の原則(DIP)を徹底しています。

### レイヤー構成

```
┌─────────────────────────────────────────────────┐
│          Interface Layer (Controllers)          │  ← 外部との接点
├─────────────────────────────────────────────────┤
│        Application Layer (Use Cases)            │  ← ビジネスロジックの orchestration
├─────────────────────────────────────────────────┤
│          Domain Layer (Entities, VOs)           │  ← ビジネスルールの中核
├─────────────────────────────────────────────────┤
│     Infrastructure Layer (Repositories)         │  ← 外部システムとの統合
└─────────────────────────────────────────────────┘
```

**依存関係の方向**: 外側 → 内側 (Interface → Application → Domain ← Infrastructure)

---

## 採用アーキテクチャの選定理由

### オニオンアーキテクチャ vs クリーンアーキテクチャ: 技術的比較

#### 1. 現在のコードベースの分析

現在の実装を分析した結果、以下の特徴が確認されました:

```typescript
// Domain層でのインターフェース定義
export interface IUserRepository {
  create(user: SaveUserVo): Promise<User>;
  update(user: SaveUserVo): Promise<User>;
}

// Infrastructure層での実装
@Injectable()
export class UsersRepository implements IUserRepository {
  constructor(private readonly prismaService: PrismaService) {}
  // 実装...
}

// Application層での依存性注入
@Injectable()
export class SaveUsersUsecase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) {}
}
```

この構造は**クリーンアーキテクチャ**の特徴である:

- Domain層でのインターフェース定義
- 依存性逆転の原則(DIP)の完全な適用
- Use Caseベースのアプリケーション層設計

を完全に体現しています。

#### 2. 両アーキテクチャの比較表

| 観点                     | オニオンアーキテクチャ | クリーンアーキテクチャ | 本プロジェクトでの評価 |
| ------------------------ | ---------------------- | ---------------------- | ---------------------- |
| **レイヤー数**           | 4層(厳密)              | 4層(柔軟)              | ✅ 現在4層構造         |
| **依存方向**             | 内側のみ依存可能       | 内側のみ依存可能       | ✅ 両方適合            |
| **ドメイン中心性**       | ドメインモデル中心     | ビジネスルール中心     | ✅ 両方適合            |
| **Use Case層**           | Application Services   | Use Cases(明示的)      | ✅ Use Cases採用済み   |
| **インターフェース配置** | ドメイン層に配置       | ドメイン層に配置       | ✅ 両方適合            |
| **NestJSとの親和性**     | 高い                   | **非常に高い**         | ✅ クリーンが優位      |
| **DI活用度**             | 高い                   | **非常に高い**         | ✅ クリーンが優位      |

#### 3. クリーンアーキテクチャを推奨する理由

##### 3.1 NestJSとの技術的親和性

NestJSは以下の特徴を持ちます:

- **Moduleシステム**: 機能単位でのカプセル化
- **DIコンテナ**: インターフェースベースの依存性注入
- **Providerパターン**: クラスベースのサービス実装

これらは全て、クリーンアーキテクチャの設計原則と完全に一致します。

```typescript
// NestJSのDIとクリーンアーキテクチャの統合例
@Module({
  imports: [PrismaModule, SvixModule],
  controllers: [WebhookUsersController], // Interface Layer
  providers: [
    SaveUsersUsecase, // Application Layer
    {
      provide: USER_REPOSITORY, // Domain Interface
      useClass: UsersRepository, // Infrastructure Implementation
    },
  ],
})
export class UserModule {}
```

##### 3.2 Use Caseの明示性

クリーンアーキテクチャでは、Use Caseが第一級市民として扱われます:

```typescript
// Use Caseクラス: ビジネスロジックの単一責任
@Injectable()
export class SaveUsersUsecase {
  /**
   * ユーザー情報を保存します。
   * typeによって新規作成または更新を行います。
   */
  async execute({ type, data }: SaveUserDto): Promise<User> {
    // ビジネスロジックのオーケストレーション
  }
}
```

この設計により:

- **テスタビリティ**: Use Case単位でのテストが容易
- **可読性**: ビジネスロジックが明確
- **保守性**: 変更の影響範囲が限定的

##### 3.3 既存実装との整合性

現在のコードベースは既にクリーンアーキテクチャのパターンを実装しています:

- ✅ Domain層にリポジトリインターフェース定義
- ✅ Use Caseベースのアプリケーション層
- ✅ Value Objectによる型安全性
- ✅ Entityの不変性保証

**結論**: オニオンアーキテクチャへの移行は不要。現在のクリーンアーキテクチャを洗練・継続することが最適です。

---

## ディレクトリ構造

### プロジェクト全体構造

```
apps/backend/
├── src/
│   ├── main.ts                    # アプリケーションエントリーポイント
│   ├── config.ts                  # 環境変数・設定管理
│   └── modules/                   # 機能別モジュール
│       ├── app.module.ts          # ルートモジュール
│       ├── prisma/                # Prisma (共有インフラ)
│       ├── svix/                  # Svix Webhook検証 (共有機能)
│       └── users/                 # ユーザー機能モジュール (例)
│           ├── domain/            # ドメイン層
│           ├── application/       # アプリケーション層
│           ├── infrastructure/    # インフラストラクチャ層
│           └── interface/         # インターフェース層
├── prisma/
│   ├── schema.prisma              # データベーススキーマ定義
│   └── migrations/                # マイグレーションファイル
├── test/                          # E2Eテスト
└── [設定ファイル群]
```

### 機能モジュール内の標準構造

各機能モジュール(例: `users/`)は以下の4層構造を持ちます:

```
users/
├── domain/                        # ドメイン層 (内側の中核)
│   ├── *.entity.ts                # エンティティ
│   ├── *.vo.ts                    # Value Object
│   └── *.repository.interface.ts # リポジトリインターフェース
│
├── application/                   # アプリケーション層
│   └── *.usecase.ts               # Use Case (ビジネスロジック)
│
├── infrastructure/                # インフラストラクチャ層
│   └── *.repository.ts            # リポジトリ実装 (DB操作)
│
└── interface/                     # インターフェース層 (外側)
    ├── *.controller.ts            # コントローラー (API)
    ├── dto/                       # Data Transfer Object
    │   └── *.dto.ts
    └── mapper/                    # ドメイン⇔DTOの変換
        └── *.mapper.ts
```

---

## 各レイヤーの詳細

### 1. Domain Layer (ドメイン層)

**責務**: ビジネスルールの中核。外部への依存を一切持たない。

#### 1.1 Entity (エンティティ)

**定義**: 一意のIDを持ち、ライフサイクル全体を通じて識別可能なオブジェクト。

**実装例**: `user.entity.ts`

```typescript
import { ClerkIdVo } from "src/modules/users/domain/clerk-id.vo";
import { AvatarUrlVo } from "src/modules/users/domain/user-avatar-url.vo";
import { IdVo } from "src/modules/users/domain/user-id.vo";
import { NameVo } from "src/modules/users/domain/user-name.vo";

/**
 * ユーザーエンティティ
 *
 * 責務:
 * - ユーザーの一意性をIDで保証
 * - ビジネスルールに基づくデータの整合性維持
 * - 不変性の保証
 */
export class User {
  // コンストラクタはprivate: 外部から直接インスタンス化を防ぐ
  private constructor(
    private readonly id: IdVo,
    private readonly clerkId: ClerkIdVo,
    private readonly name: NameVo,
    private readonly avatarUrl: AvatarUrlVo
  ) {}

  /**
   * DB等から復元する際に使用するファクトリメソッド
   */
  static reconstruct(id: IdVo, clerkId: ClerkIdVo, name: NameVo, avatarUrl: AvatarUrlVo): User {
    return new User(id, clerkId, name, avatarUrl);
  }

  // Getterのみ提供: イミュータブルな設計
  getId(): IdVo {
    return this.id;
  }

  getClerkId(): ClerkIdVo {
    return this.clerkId;
  }

  getName(): NameVo {
    return this.name;
  }

  getAvatarUrl(): AvatarUrlVo {
    return this.avatarUrl;
  }
}
```

**設計原則**:

- ✅ **不変性(Immutability)**: `readonly`修飾子を使用
- ✅ **カプセル化**: privateコンストラクタ + ファクトリメソッド
- ✅ **Value Objectの活用**: プリミティブ型を直接使わない

#### 1.2 Value Object (値オブジェクト)

**定義**: 値そのもので識別されるオブジェクト。不変かつ等価性比較可能。

**実装例**: `clerk-id.vo.ts`

```typescript
/**
 * Clerk ID用のValue Object
 *
 * 責務:
 * - Clerk IDのフォーマット検証
 * - ビジネスルールに基づくバリデーション
 * - 型安全性の提供
 */
export class ClerkIdVo {
  private constructor(private readonly value: string) {}

  /**
   * ファクトリメソッド: 検証を経てインスタンス化
   */
  static of(value: string): ClerkIdVo {
    this.validate(value);
    return new ClerkIdVo(value);
  }

  /**
   * ビジネスルールに基づく検証ロジック
   */
  private static validate(value: string): void {
    if (typeof value !== "string") {
      throw new Error("Clerk ID must be a string");
    }

    if (value.trim().length === 0) {
      throw new Error("Clerk ID cannot be empty");
    }

    // Clerk固有のビジネスルール
    if (!value.startsWith("user")) {
      throw new Error("Invalid Clerk ID");
    }
  }

  getValue(): string {
    return this.value;
  }

  /**
   * 等価性比較: 値が同じなら同一とみなす
   */
  equals(other: ClerkIdVo): boolean {
    return this.value === other.value;
  }
}
```

**Value Objectのメリット**:

- ✅ **型安全性**: `string`ではなく`ClerkIdVo`として扱う
- ✅ **バリデーション集約**: 検証ロジックが一箇所に集まる
- ✅ **意図の明確化**: コードの可読性が向上

**新規Value Object作成時のチェックリスト**:

- [ ] `private constructor`を使用
- [ ] `static of()`ファクトリメソッドを実装
- [ ] `validate()`で全てのビジネスルールを検証
- [ ] `getValue()`で内部値を公開
- [ ] `equals()`で等価性比較を実装
- [ ] `readonly`修飾子で不変性を保証

#### 1.3 Repository Interface (リポジトリインターフェース)

**定義**: データ永続化の抽象化。Domainの要求を定義し、Infrastructureが実装する。

**実装例**: `user.repository.interface.ts`

```typescript
import { SaveUserVo } from "src/modules/users/domain/save-user.vo";
import { User } from "src/modules/users/domain/user.entity";

/**
 * DIトークン: NestJSのDIコンテナで使用
 * Symbolを使うことで名前衝突を防ぐ
 */
export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

/**
 * ユーザーリポジトリのインターフェース
 *
 * 責務:
 * - Domain層が必要とするデータ操作の契約を定義
 * - 具体的な実装詳細は隠蔽
 */
export interface IUserRepository {
  /**
   * ユーザーを新規作成
   * @returns 作成されたUserエンティティ
   */
  create(user: SaveUserVo): Promise<User>;

  /**
   * ユーザーを更新
   * @returns 更新されたUserエンティティ
   */
  update(user: SaveUserVo): Promise<User>;
}
```

**設計原則**:

- ✅ **依存性逆転**: Domain層がインターフェースを定義
- ✅ **抽象化**: DB実装の詳細を隠蔽
- ✅ **テスタビリティ**: モック化が容易

---

### 2. Application Layer (アプリケーション層)

**責務**: ビジネスロジックのオーケストレーション。Use Caseの実装。

#### 2.1 Use Case (ユースケース)

**定義**: 単一のビジネスユースケースを表現するクラス。

**実装例**: `save-users.usecase.ts`

```typescript
import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";

import { ClerkIdVo } from "src/modules/users/domain/clerk-id.vo";
import { SaveUserVo } from "src/modules/users/domain/save-user.vo";
import { AvatarUrlVo } from "src/modules/users/domain/user-avatar-url.vo";
import { NameVo } from "src/modules/users/domain/user-name.vo";
import { User } from "src/modules/users/domain/user.entity";
import {
  IUserRepository,
  USER_REPOSITORY,
} from "src/modules/users/domain/user.repository.interface";
import { SaveUserDto, saveUserEventTypes } from "src/modules/users/interface/dto/save-user.dto";

/**
 * ユーザー保存 Use Case
 *
 * 責務:
 * - 外部イベント(Webhook)からのユーザーデータ保存
 * - 作成/更新の分岐処理
 * - ドメインオブジェクトの組み立て
 */
@Injectable()
export class SaveUsersUsecase {
  private readonly logger = new Logger(SaveUsersUsecase.name);

  constructor(
    // インターフェースへの依存: テスト時にモック化可能
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * ユーザー情報を保存します。
   *
   * @param {SaveUserDto} props - 保存するユーザーデータとイベントタイプ
   * @param {string} props.type - イベントタイプ ("user.created" | "user.updated")
   * @param {object} props.data - ユーザーデータ
   * @returns 保存されたUserエンティティ
   * @throws BadRequestException - サポートされていないtypeの場合
   */
  async execute({ type, data }: SaveUserDto): Promise<User> {
    // 1. DTOからValue Objectへの変換
    const user = SaveUserVo.create(
      ClerkIdVo.of(data.id),
      NameVo.of(data.username),
      AvatarUrlVo.of(data.image_url)
    );

    // 2. ビジネスロジック: イベントタイプに基づく処理分岐
    if (type === saveUserEventTypes.CREATE) {
      const createdUser = await this.userRepository.create(user);
      this.logger.log("User created successfully");
      return createdUser;
    } else if (type === saveUserEventTypes.UPDATE) {
      const updatedUser = await this.userRepository.update(user);
      this.logger.log("User updated successfully");
      return updatedUser;
    }

    // 3. エラーハンドリング
    const errorMessage = "Unsupported event type";
    this.logger.error(errorMessage);
    throw new BadRequestException(errorMessage);
  }
}
```

**Use Case設計のポイント**:

- ✅ **単一責任**: 1つのUse Caseは1つのビジネスユースケースのみ
- ✅ **execute()メソッド**: エントリーポイントを統一
- ✅ **ロギング**: ビジネスイベントの記録
- ✅ **エラーハンドリング**: 適切な例外の投げ分け

**新規Use Case作成時のチェックリスト**:

- [ ] `@Injectable()`デコレータを付与
- [ ] `execute()`メソッドを実装
- [ ] コンストラクタでリポジトリを注入
- [ ] `Logger`でビジネスイベントを記録
- [ ] TSDocで詳細なドキュメントを記述

---

### 3. Infrastructure Layer (インフラストラクチャ層)

**責務**: 外部システム(DB, API等)との統合。Domain層のインターフェースを実装。

#### 3.1 Repository Implementation (リポジトリ実装)

**実装例**: `users.repository.ts`

```typescript
import { Injectable } from "@nestjs/common";

import { PrismaService } from "src/modules/prisma/application/prisma.service";
import { ClerkIdVo } from "src/modules/users/domain/clerk-id.vo";
import { SaveUserVo } from "src/modules/users/domain/save-user.vo";
import { AvatarUrlVo } from "src/modules/users/domain/user-avatar-url.vo";
import { IdVo } from "src/modules/users/domain/user-id.vo";
import { NameVo } from "src/modules/users/domain/user-name.vo";
import { User } from "src/modules/users/domain/user.entity";
import { IUserRepository } from "src/modules/users/domain/user.repository.interface";

/**
 * ユーザーリポジトリ実装 (Prisma)
 *
 * 責務:
 * - IUserRepositoryインターフェースの実装
 * - PrismaによるDB操作
 * - DBモデル ⇔ ドメインエンティティの変換
 */
@Injectable()
export class UsersRepository implements IUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 新しいユーザーを作成します。
   *
   * @param {SaveUserVo} user - 保存するユーザーデータ
   * @returns {User} 作成されたUserエンティティ
   */
  async create(user: SaveUserVo): Promise<User> {
    return await this.prismaService.user
      .create({
        data: {
          // Value ObjectからプリミティブへDBマッピング
          clerkId: user.getClerkId().getValue(),
          name: user.getName().getValue(),
          avatarUrl: user.getAvatarUrl().getValue(),
        },
      })
      .then((prismaUser) => {
        // PrismaモデルからDomainエンティティへ変換
        return User.reconstruct(
          IdVo.of(prismaUser.id),
          ClerkIdVo.of(prismaUser.clerkId),
          NameVo.of(prismaUser.name),
          AvatarUrlVo.of(prismaUser.avatarUrl)
        );
      });
  }

  /**
   * 既存のユーザーを更新します。
   *
   * @param {SaveUserVo} user - 更新するユーザーデータ
   * @returns {User} 更新されたUserエンティティ
   */
  async update(user: SaveUserVo): Promise<User> {
    return await this.prismaService.user
      .update({
        where: {
          clerkId: user.getClerkId().getValue(),
        },
        data: {
          name: user.getName().getValue(),
          avatarUrl: user.getAvatarUrl().getValue(),
        },
      })
      .then((prismaUser) => {
        return User.reconstruct(
          IdVo.of(prismaUser.id),
          ClerkIdVo.of(prismaUser.clerkId),
          NameVo.of(prismaUser.name),
          AvatarUrlVo.of(prismaUser.avatarUrl)
        );
      });
  }
}
```

**設計ポイント**:

- ✅ **双方向マッピング**: DB ⇔ Domain の変換を担当
- ✅ **技術的詳細の隠蔽**: Prismaの使用をDomain層から隠す
- ✅ **エラーハンドリング**: DB例外をドメイン例外に変換(必要に応じて)

---

### 4. Interface Layer (インターフェース層)

**責務**: 外部からのリクエスト受付とレスポンス返却。

#### 4.1 Controller (コントローラー)

**実装例**: `webhook-users.controller.ts`

```typescript
import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Headers,
  RawBodyRequest,
  Req,
  Logger,
} from "@nestjs/common";

import { VerifySvixSignatureUsecase } from "src/modules/svix/application/verify-svix-signature.usecase";
import { SaveUsersUsecase } from "src/modules/users/application/save-users.usecase";
import { SaveUserDto } from "src/modules/users/interface/dto/save-user.dto";
import { UserMapper, UsersResponse } from "src/modules/users/interface/mapper/user.mapper";

/**
 * Clerk Webhookユーザーコントローラー
 *
 * 責務:
 * - Webhookリクエストの受信
 * - Svix署名検証
 * - Use Caseの呼び出し
 * - レスポンスの整形
 */
@Controller("webhooks/clerk/users")
export class WebhookUsersController {
  private readonly logger = new Logger(WebhookUsersController.name);

  constructor(
    private readonly saveUsersUsecase: SaveUsersUsecase,
    private readonly verifySvixSignatureUsecase: VerifySvixSignatureUsecase
  ) {}

  /**
   * ユーザー作成/更新Webhookエンドポイント
   *
   * @param svixId - Svix署名検証用ID
   * @param timestamp - Svixタイムスタンプ
   * @param signature - Svix署名
   * @param saveUserDto - ユーザーデータ
   * @param req - Rawリクエスト(署名検証用)
   * @returns ユーザーレスポンス
   */
  @Post()
  async save(
    @Headers("svix-id") svixId: string,
    @Headers("svix-timestamp") timestamp: string,
    @Headers("svix-signature") signature: string,
    @Body() saveUserDto: SaveUserDto,
    @Req() req: RawBodyRequest<Request>
  ): Promise<UsersResponse> {
    // 1. バリデーション: 必須ヘッダーの確認
    if (!svixId || !timestamp || !signature) {
      const errorMessage = "Missing Svix headers for webhook verification";
      this.logger.error(errorMessage);
      throw new BadRequestException(errorMessage);
    }

    // 2. セキュリティ: Webhook署名検証
    this.verifySvixSignatureUsecase.execute(req, svixId, timestamp, signature);

    // 3. Use Case実行
    const user = await this.saveUsersUsecase.execute(saveUserDto);
    this.logger.log("User saved successfully");

    // 4. レスポンス整形
    return UserMapper.formatResponse(user);
  }
}
```

**Controller設計のポイント**:

- ✅ **薄い層**: ビジネスロジックは書かない
- ✅ **Use Caseへの委譲**: ロジックはUse Caseに任せる
- ✅ **DTO/Mapperの活用**: ドメインオブジェクトを直接公開しない

#### 4.2 DTO (Data Transfer Object)

**実装例**: `save-user.dto.ts`

```typescript
/**
 * サポートされるイベントタイプ
 */
export const saveUserEventTypes = {
  CREATE: "user.created",
  UPDATE: "user.updated",
} as const;

/**
 * ユーザー保存DTO
 *
 * 責務:
 * - Webhookペイロードの型定義
 * - バリデーション(class-validatorと組み合わせ)
 */
export class SaveUserDto {
  type: (typeof saveUserEventTypes)[keyof typeof saveUserEventTypes];
  data: {
    id: string;
    username: string;
    image_url: string;
  };
}
```

**DTOのベストプラクティス**:

- ✅ **外部APIスキーマに一致**: ClerkのWebhook仕様に合わせる
- ✅ **バリデーション**: `class-validator`デコレータを活用
- ✅ **型安全性**: TypeScriptの型システムを最大限活用

#### 4.3 Mapper (マッパー)

**実装例**: `user.mapper.ts`

```typescript
import { User } from "src/modules/users/domain/user.entity";

/**
 * ユーザーレスポンス型
 */
export interface UsersResponse {
  id: string;
  clerkId: string;
  name: string;
  avatarUrl: string;
}

/**
 * ユーザーマッパー
 *
 * 責務:
 * - Domainエンティティ → レスポンスDTOへの変換
 */
export class UserMapper {
  /**
   * UserエンティティをレスポンスDTOに変換
   */
  static formatResponse(user: User): UsersResponse {
    return {
      id: user.getId().getValue(),
      clerkId: user.getClerkId().getValue(),
      name: user.getName().getValue(),
      avatarUrl: user.getAvatarUrl().getValue(),
    };
  }
}
```

**Mapperの役割**:

- ✅ **境界の保護**: ドメインオブジェクトを直接外部に公開しない
- ✅ **変換ロジック集約**: DTO変換ロジックを一箇所に集める
- ✅ **疎結合**: APIレスポンス形式の変更が容易

---

### 5. Module (NestJSモジュール)

**実装例**: `user.module.ts`

```typescript
import { Module } from "@nestjs/common";

import { PrismaModule } from "src/modules/prisma/prisma.module";
import { SvixModule } from "src/modules/svix.module";
import { SaveUsersUsecase } from "src/modules/users/application/save-users.usecase";
import { USER_REPOSITORY } from "src/modules/users/domain/user.repository.interface";
import { UsersRepository } from "src/modules/users/infrastructure/users.repository";
import { WebhookUsersController } from "src/modules/users/interface/webhook-users.controller";

/**
 * ユーザーモジュール
 *
 * 責務:
 * - ユーザー機能に関連するコンポーネントの集約
 * - DIコンテナへの登録
 * - 他モジュールとの統合
 */
@Module({
  imports: [
    PrismaModule, // Prismaサービスの利用
    SvixModule, // Svix検証の利用
  ],
  controllers: [
    WebhookUsersController, // Interface Layer
  ],
  providers: [
    SaveUsersUsecase, // Application Layer
    // Infrastructure LayerをDomain Interfaceに紐付け
    {
      provide: USER_REPOSITORY, // トークン
      useClass: UsersRepository, // 実装クラス
    },
  ],
})
export class UserModule {}
```

**Module設計のポイント**:

- ✅ **機能単位**: 1機能 = 1モジュール
- ✅ **DIの設定**: `provide`でインターフェースと実装を紐付け
- ✅ **依存モジュールのimport**: 必要な機能を明示的に宣言

---

## 実装ガイドライン

### 新機能追加の手順

新しい機能(例: `posts`モジュール)を追加する場合の標準手順:

#### Step 1: ディレクトリ構造の作成

```bash
mkdir -p src/modules/posts/{domain,application,infrastructure,interface/{dto,mapper}}
```

#### Step 2: Domain層の実装

**優先順位**: ① Value Object → ② Entity → ③ Repository Interface

```typescript
// 1. Value Object: post-id.vo.ts
export class PostIdVo {
  private constructor(private readonly value: string) {}
  static of(value: string): PostIdVo {
    // バリデーション
    return new PostIdVo(value);
  }
  getValue(): string {
    return this.value;
  }
}

// 2. Entity: post.entity.ts
export class Post {
  private constructor(
    private readonly id: PostIdVo,
    private readonly title: TitleVo,
    private readonly content: ContentVo
  ) {}

  static reconstruct(id: PostIdVo, title: TitleVo, content: ContentVo): Post {
    return new Post(id, title, content);
  }

  // Getters...
}

// 3. Repository Interface: post.repository.interface.ts
export const POST_REPOSITORY = Symbol("POST_REPOSITORY");

export interface IPostRepository {
  findById(id: PostIdVo): Promise<Post | null>;
  save(post: Post): Promise<Post>;
}
```

#### Step 3: Application層の実装

```typescript
// create-post.usecase.ts
@Injectable()
export class CreatePostUsecase {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: IPostRepository
  ) {}

  async execute(dto: CreatePostDto): Promise<Post> {
    // ビジネスロジック
    const post = Post.create(/* ... */);
    return await this.postRepository.save(post);
  }
}
```

#### Step 4: Infrastructure層の実装

```typescript
// posts.repository.ts
@Injectable()
export class PostsRepository implements IPostRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: PostIdVo): Promise<Post | null> {
    const prismaPost = await this.prismaService.post.findUnique({
      where: { id: id.getValue() },
    });

    if (!prismaPost) return null;

    // Prismaモデル → Domainエンティティ変換
    return Post.reconstruct(/* ... */);
  }

  async save(post: Post): Promise<Post> {
    // 実装...
  }
}
```

#### Step 5: Interface層の実装

```typescript
// posts.controller.ts
@Controller("posts")
export class PostsController {
  constructor(private readonly createPostUsecase: CreatePostUsecase) {}

  @Post()
  async create(@Body() dto: CreatePostDto): Promise<PostResponse> {
    const post = await this.createPostUsecase.execute(dto);
    return PostMapper.formatResponse(post);
  }
}
```

#### Step 6: Moduleの作成

```typescript
// post.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [PostsController],
  providers: [CreatePostUsecase, { provide: POST_REPOSITORY, useClass: PostsRepository }],
  exports: [CreatePostUsecase], // 他モジュールで使う場合
})
export class PostModule {}
```

#### Step 7: AppModuleに登録

```typescript
// app.module.ts
@Module({
  imports: [
    PrismaModule,
    UserModule,
    PostModule, // 追加
  ],
})
export class AppModule {}
```

---

## コーディング規約とベストプラクティス

### 1. 命名規則

| 対象                 | 規則                        | 例                             |
| -------------------- | --------------------------- | ------------------------------ |
| Entity               | `*.entity.ts`               | `user.entity.ts`               |
| Value Object         | `*.vo.ts`                   | `user-id.vo.ts`                |
| Use Case             | `*.usecase.ts`              | `save-users.usecase.ts`        |
| Repository Interface | `*.repository.interface.ts` | `user.repository.interface.ts` |
| Repository Impl      | `*.repository.ts`           | `users.repository.ts`          |
| Controller           | `*.controller.ts`           | `webhook-users.controller.ts`  |
| DTO                  | `*.dto.ts`                  | `save-user.dto.ts`             |
| Mapper               | `*.mapper.ts`               | `user.mapper.ts`               |
| Module               | `*.module.ts`               | `user.module.ts`               |

### 2. インポート順序

```typescript
// 1. NestJS関連
import { Injectable, Inject } from "@nestjs/common";

// 2. 外部ライブラリ
import { Prisma } from "@prisma/client";

// 3. 同一レイヤー内
import { User } from "src/modules/users/domain/user.entity";
import { UserIdVo } from "src/modules/users/domain/user-id.vo";

// 4. 他レイヤー(domain → application → infrastructure → interface)
import {
  IUserRepository,
  USER_REPOSITORY,
} from "src/modules/users/domain/user.repository.interface";
import { SaveUsersUsecase } from "src/modules/users/application/save-users.usecase";
```

### 3. TSDocコメント

**必須箇所**:

- すべてのpublicメソッド
- Use Caseの`execute()`
- Entity/VOのファクトリメソッド
- Repositoryのメソッド

**テンプレート**:

````typescript
/**
 * [メソッドの目的を1行で記述]
 *
 * [詳細説明(必要に応じて)]
 *
 * @param {型} 引数名 - 引数の説明
 * @returns {型} 戻り値の説明
 * @throws {例外型} - 例外がスローされる条件
 *
 * @example
 * ```typescript
 * const user = await usecase.execute({ type: "user.created", data: {...} });
 * ```
 */
````

### 4. エラーハンドリング

**原則**:

- Domain層: ドメインルール違反は`Error`をthrow
- Application層: ビジネスロジック違反は`BadRequestException`等
- Infrastructure層: 技術的エラーは適切な例外に変換

**例**:

```typescript
// Domain層
if (value.length === 0) {
  throw new Error("User name cannot be empty");  // ドメインルール
}

// Application層
if (type !== "user.created" && type !== "user.updated") {
  throw new BadRequestException("Unsupported event type");  // HTTP例外
}

// Infrastructure層
try {
  return await this.prismaService.user.create({...});
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new ConflictException("User already exists");  // DB例外 → HTTP例外
    }
  }
  throw error;
}
```

### 5. テスト戦略

#### Unit Test (各レイヤー)

```typescript
// Use Caseのテスト例
describe('SaveUsersUsecase', () => {
  let usecase: SaveUsersUsecase;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    // モックリポジトリを使用
    mockRepository = {
      create: jest.fn(),
      update: jest.fn(),
    };
    usecase = new SaveUsersUsecase(mockRepository);
  });

  it('should create user when type is user.created', async () => {
    const dto = { type: 'user.created', data: {...} };
    await usecase.execute(dto);
    expect(mockRepository.create).toHaveBeenCalled();
  });
});
```

#### E2E Test

```typescript
// Webhookのテスト例
describe('WebhookUsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/webhooks/clerk/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/webhooks/clerk/users')
      .set('svix-id', 'test-id')
      .set('svix-timestamp', '1234567890')
      .set('svix-signature', 'valid-signature')
      .send({ type: 'user.created', data: {...} })
      .expect(201);
  });
});
```

### 6. 依存関係のルール

**許可される依存方向**:

```
Interface → Application → Domain ← Infrastructure
```

**禁止される依存**:

- ❌ Domain → Application
- ❌ Domain → Infrastructure
- ❌ Domain → Interface
- ❌ Application → Infrastructure (インターフェース経由はOK)

**チェック方法**:
ESLintの`import/no-restricted-paths`を使用して強制可能。

### 7. 不変性の徹底

**原則**:

- すべてのDomainオブジェクトは不変
- `readonly`修飾子を必ず使用
- Setterは作らない

**正しい例**:

```typescript
export class User {
  private constructor(
    private readonly id: IdVo,
    private readonly name: NameVo
  ) {}

  // 変更が必要な場合は新しいインスタンスを返す
  changeName(newName: NameVo): User {
    return User.reconstruct(this.id, newName);
  }
}
```

**誤った例**:

```typescript
// ❌ 悪い例
export class User {
  private id: IdVo;
  private name: NameVo;

  setName(name: NameVo) {
    // Setterは作らない
    this.name = name;
  }
}
```

---

## まとめ

### アーキテクチャの核心

本プロジェクトのクリーンアーキテクチャは、以下の原則に基づいています:

1. **依存性逆転の原則 (DIP)**: Domain層がインターフェースを定義し、Infrastructure層が実装
2. **単一責任の原則 (SRP)**: 各レイヤー・クラスは単一の責務のみを持つ
3. **オープン・クローズドの原則 (OCP)**: 拡張に開き、修正に閉じた設計
4. **インターフェース分離の原則 (ISP)**: 必要最小限のインターフェース定義
5. **リスコフの置換原則 (LSP)**: 抽象に依存し、実装を簡単に差し替え可能

### NestJSとの統合

NestJSの強力な機能を活用:

- **DIコンテナ**: インターフェースベースの依存性注入
- **Moduleシステム**: 機能単位でのカプセル化
- **デコレータ**: メタデータベースの宣言的設計

### チーム開発への適合性

このアーキテクチャは以下を実現します:

- ✅ **明確な責任分離**: 誰がどこを担当するか明確
- ✅ **並行開発が容易**: レイヤーごとに独立して開発可能
- ✅ **テスト容易性**: モック化・スタブ化が簡単
- ✅ **保守性**: 変更の影響範囲が限定的
- ✅ **拡張性**: 新機能追加が体系的

### さらなる学習リソース

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [NestJS公式ドキュメント](https://docs.nestjs.com/)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)

---

**Document Version**: 1.0
**Last Updated**: 2025年12月7日
**Author**: Disculla Development Team
