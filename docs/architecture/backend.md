# Backend Architecture Guide

## 📋 目次

- [アーキテクチャ概要](#アーキテクチャ概要)
- [ディレクトリ構造](#ディレクトリ構造)
- [層別の詳細説明](#層別の詳細説明)
- [実装ガイドライン](#実装ガイドライン)
- [コーディング規約](#コーディング規約)
- [実装例](#実装例)

---

## アーキテクチャ概要

### 採用パターン

**Clean Architecture (クリーンアーキテクチャ)**

### 基本原則

1. **依存性の方向**: 外側から内側へ (Infrastructure → Application → Domain)
2. **ビジネスロジックの独立性**: フレームワーク、DB、外部ライブラリから独立
3. **テスタビリティ**: 各層を独立してテスト可能
4. **保守性**: 変更の影響範囲を最小化

### 依存関係図

```
┌─────────────────────────────────────────┐
│  Infrastructure Layer (外側)             │
│  - Repository実装                        │
│  - 外部API統合                           │
│  - DB接続                                │
└─────────────┬───────────────────────────┘
              │ 依存
┌─────────────▼───────────────────────────┐
│  Interface Layer (プレゼンテーション)    │
│  - Controller                            │
│  - DTO                                   │
│  - Mapper                                │
└─────────────┬───────────────────────────┘
              │ 依存
┌─────────────▼───────────────────────────┐
│  Application Layer (ユースケース)       │
│  - UseCase/Service                       │
│  - ビジネスフロー制御                    │
└─────────────┬───────────────────────────┘
              │ 依存
┌─────────────▼───────────────────────────┐
│  Domain Layer (最内側・依存なし)        │
│  - Entity                                │
│  - Value Object                          │
│  - Repository Interface                  │
└─────────────────────────────────────────┘
```

**重要**: 依存の方向は必ず内側(Domain)に向かう。内側の層は外側の層を知らない。

---

## ディレクトリ構造

### 標準構造

```
src/
├── config.ts                       # 設定ファイル
├── main.ts                         # エントリーポイント
├── domain/                         # 共通ドメイン層(複数モジュール共有)
│   └── shared-value.vo.ts         # 共有値オブジェクト
│
└── modules/                        # 機能モジュール群
    ├── app.module.ts              # ルートモジュール
    │
    ├── {feature}/                 # 機能別モジュール
    │   ├── domain/                # ドメイン層
    │   │   ├── {entity}.entity.ts
    │   │   ├── {property}.vo.ts
    │   │   ├── create-{entity}.vo.ts
    │   │   ├── update-{entity}.vo.ts
    │   │   └── {entity}.repository.interface.ts
    │   │
    │   ├── application/           # アプリケーション層
    │   │   ├── {action}-{entity}.usecase.ts
    │   │   └── {action}-{entity}.usecase.spec.ts
    │   │
    │   ├── infrastructure/        # インフラストラクチャ層
    │   │   └── {entity}.repository.ts
    │   │
    │   ├── interface/             # インターフェース層
    │   │   ├── dto/
    │   │   │   ├── create-{entity}.dto.ts
    │   │   │   ├── update-{entity}.dto.ts
    │   │   │   └── {entity}-response.dto.ts
    │   │   ├── mapper/
    │   │   │   └── {entity}.mapper.ts
    │   │   ├── {entity}.controller.ts
    │   │   └── {entity}.controller.spec.ts
    │   │
    │   └── {feature}.module.ts    # モジュール定義
    │
    └── shared/                     # 共有インフラ(prisma等)
        ├── prisma/
        │   ├── application/
        │   │   └── prisma.service.ts
        │   └── prisma.module.ts
        └── ...
```

### 実際の例 (users モジュール)

```
modules/users/
├── domain/
│   ├── user.entity.ts                      # Userエンティティ
│   ├── user-id.vo.ts                       # ユーザーID値オブジェクト
│   ├── clerk-id.vo.ts                      # Clerk ID値オブジェクト
│   ├── user-name.vo.ts                     # ユーザー名値オブジェクト
│   ├── user-avatar-url.vo.ts               # アバターURL値オブジェクト
│   ├── save-user.vo.ts                     # ユーザー保存用VO
│   └── user.repository.interface.ts        # リポジトリインターフェース
│
├── application/
│   ├── save-users.usecase.ts               # ユーザー保存ユースケース
│   └── save-users.usecase.spec.ts          # テスト
│
├── infrastructure/
│   └── users.repository.ts                 # リポジトリ実装(Prisma)
│
├── interface/
│   ├── dto/
│   │   └── save-user.dto.ts               # 保存用DTO
│   ├── mapper/
│   │   └── user.mapper.ts                 # DTO⇔Entity変換
│   ├── webhook-users.controller.ts         # Webhookコントローラー
│   └── webhook-users.controller.spec.ts    # テスト
│
└── user.module.ts                          # モジュール定義
```

---

## 層別の詳細説明

### 1. Domain Layer (ドメイン層)

**責務**: ビジネスルールとドメイン知識の表現

**特徴**:

- どの層にも依存しない
- フレームワーク非依存
- 純粋なTypeScript/JavaScript

**含まれるファイル**:

#### Entity (`{entity}.entity.ts`)

- ビジネスの中核概念を表現
- 一意なIDを持つ
- ライフサイクルを持つ

```typescript
export class User {
  constructor(
    private readonly id: UserId,
    private name: UserName,
    private readonly clerkId: ClerkId,
    private avatarUrl: UserAvatarUrl
  ) {}

  // ゲッター
  getId(): UserId {
    return this.id;
  }
  getName(): UserName {
    return this.name;
  }

  // ドメインロジック
  updateName(newName: UserName): void {
    this.name = newName;
  }
}
```

#### Value Object (`{property}.vo.ts`)

- 不変の値を表現
- バリデーションロジックを内包
- 等価性は値で判断

```typescript
export class UserEmail {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  static create(email: string): UserEmail {
    return new UserEmail(email);
  }

  private validate(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserEmail): boolean {
    return this.value === other.value;
  }
}
```

#### Repository Interface (`{entity}.repository.interface.ts`)

- データ永続化の抽象定義
- 実装を持たない(インターフェースのみ)

```typescript
export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByClerkId(clerkId: ClerkId): Promise<User | null>;
  delete(id: UserId): Promise<void>;
}

export const IUserRepository = Symbol("IUserRepository");
```

---

### 2. Application Layer (アプリケーション層)

**責務**: ユースケース(ビジネスフロー)の実装

**特徴**:

- Domain層のみに依存
- 複数のエンティティを協調させる
- トランザクション管理

**含まれるファイル**:

#### UseCase/Service (`{action}-{entity}.usecase.ts`)

```typescript
@Injectable()
export class SaveUsersUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository
  ) {}

  async execute(saveUserVo: SaveUserVo): Promise<void> {
    // 1. 既存ユーザーの確認
    const existingUser = await this.userRepository.findByClerkId(saveUserVo.getClerkId());

    if (existingUser) {
      // 2. 更新ロジック
      existingUser.updateName(saveUserVo.getName());
      existingUser.updateAvatarUrl(saveUserVo.getAvatarUrl());
      await this.userRepository.save(existingUser);
    } else {
      // 3. 新規作成ロジック
      const newUser = User.create(
        saveUserVo.getName(),
        saveUserVo.getClerkId(),
        saveUserVo.getAvatarUrl()
      );
      await this.userRepository.save(newUser);
    }
  }
}
```

---

### 3. Infrastructure Layer (インフラストラクチャ層)

**責務**: 外部システムとの接続(DB、外部API等)

**特徴**:

- Domain層のインターフェースを実装
- ORMやHTTPクライアントを利用

**含まれるファイル**:

#### Repository Implementation (`{entity}.repository.ts`)

```typescript
@Injectable()
export class UsersRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { clerkId: user.getClerkId().getValue() },
      update: {
        name: user.getName().getValue(),
        avatarUrl: user.getAvatarUrl().getValue(),
      },
      create: {
        id: user.getId().getValue(),
        clerkId: user.getClerkId().getValue(),
        name: user.getName().getValue(),
        avatarUrl: user.getAvatarUrl().getValue(),
      },
    });
  }

  async findByClerkId(clerkId: ClerkId): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { clerkId: clerkId.getValue() },
    });

    if (!userData) return null;

    return User.reconstruct(
      UserId.create(userData.id),
      UserName.create(userData.name),
      ClerkId.create(userData.clerkId),
      UserAvatarUrl.create(userData.avatarUrl)
    );
  }
}
```

---

### 4. Interface Layer (インターフェース層)

**責務**: 外部とのやり取り(HTTP、WebSocket等)

**特徴**:

- Application層に依存
- リクエスト/レスポンスの変換

**含まれるファイル**:

#### Controller (`{entity}.controller.ts`)

```typescript
@Controller("webhooks/users")
export class WebhookUsersController {
  constructor(
    private readonly saveUsersUseCase: SaveUsersUseCase,
    private readonly verifySvixSignatureUseCase: VerifySvixSignatureUseCase
  ) {}

  @Post()
  async handleWebhook(
    @Body() dto: SaveUserDto,
    @Headers() headers: Record<string, string>
  ): Promise<void> {
    // 1. 署名検証
    await this.verifySvixSignatureUseCase.execute(headers, dto);

    // 2. DTOからVOへ変換
    const saveUserVo = SaveUserVo.create(
      ClerkId.create(dto.clerkId),
      UserName.create(dto.name),
      UserAvatarUrl.create(dto.avatarUrl)
    );

    // 3. ユースケース実行
    await this.saveUsersUseCase.execute(saveUserVo);
  }
}
```

#### DTO (`{action}-{entity}.dto.ts`)

```typescript
export class SaveUserDto {
  @IsString()
  @IsNotEmpty()
  clerkId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
```

#### Mapper (`{entity}.mapper.ts`)

```typescript
export class UserMapper {
  static toResponseDto(user: User): UserResponseDto {
    return {
      id: user.getId().getValue(),
      name: user.getName().getValue(),
      avatarUrl: user.getAvatarUrl().getValue(),
    };
  }

  static toEntity(dto: SaveUserDto): User {
    return User.create(
      UserName.create(dto.name),
      ClerkId.create(dto.clerkId),
      UserAvatarUrl.create(dto.avatarUrl)
    );
  }
}
```

---

## 実装ガイドライン

### 新機能追加の手順

1. **Domain層から実装開始**
   - Entity定義
   - Value Object定義
   - Repository Interface定義

2. **Application層の実装**
   - UseCaseの実装
   - ビジネスロジックの記述

3. **Infrastructure層の実装**
   - Repository実装
   - 外部システム統合

4. **Interface層の実装**
   - Controller実装
   - DTO定義
   - Mapper実装

5. **Module定義**
   - DIコンテナ設定
   - 依存関係の注入

### テスト戦略

```typescript
// Domain層: 単体テスト
describe("UserEmail", () => {
  it("should create valid email", () => {
    const email = UserEmail.create("test@example.com");
    expect(email.getValue()).toBe("test@example.com");
  });

  it("should throw error for invalid email", () => {
    expect(() => UserEmail.create("invalid")).toThrow();
  });
});

// Application層: ユースケーステスト
describe("SaveUsersUseCase", () => {
  it("should save new user", async () => {
    const mockRepo = createMock<IUserRepository>();
    const useCase = new SaveUsersUseCase(mockRepo);
    // テストロジック
  });
});

// Interface層: 統合テスト
describe("WebhookUsersController", () => {
  it("should handle webhook request", async () => {
    // E2Eテストロジック
  });
});
```

---

## コーディング規約

### 命名規則

| 種別                      | パターン                           | 例                             |
| ------------------------- | ---------------------------------- | ------------------------------ |
| Entity                    | `{entity}.entity.ts`               | `user.entity.ts`               |
| Value Object              | `{property}.vo.ts`                 | `user-email.vo.ts`             |
| Repository Interface      | `{entity}.repository.interface.ts` | `user.repository.interface.ts` |
| Repository Implementation | `{entity}.repository.ts`           | `users.repository.ts`          |
| UseCase                   | `{action}-{entity}.usecase.ts`     | `save-users.usecase.ts`        |
| Controller                | `{entity}.controller.ts`           | `webhook-users.controller.ts`  |
| DTO                       | `{action}-{entity}.dto.ts`         | `create-user.dto.ts`           |
| Module                    | `{feature}.module.ts`              | `user.module.ts`               |

### クラス命名規則

```typescript
// Entity: 単数形
class User {}

// Value Object: 具体的な名前
class UserEmail {}
class UserPassword {}

// Repository Interface: I + Entity名 + Repository
interface IUserRepository {}

// Repository Implementation: Entity名(複数形) + Repository
class UsersRepository implements IUserRepository {}

// UseCase: 動詞 + Entity名 + UseCase
class SaveUsersUseCase {}
class FindUserByIdUseCase {}

// Controller: Entity名 + Controller
class UsersController {}
class WebhookUsersController {}
```

### ファイル構成のベストプラクティス

1. **1ファイル1クラス**: 原則として1ファイルに1つのクラスのみ
2. **相対パスの制限**: 同一モジュール内のインポートのみ相対パス使用
3. **循環参照の禁止**: 依存関係グラフに循環を作らない
4. **インターフェースの分離**: 小さく特化したインターフェースを定義

### エラーハンドリング

```typescript
// Domain層: ドメイン例外
export class InvalidEmailError extends Error {
  constructor(email: string) {
    super(`Invalid email format: ${email}`);
    this.name = "InvalidEmailError";
  }
}

// Application層: ビジネスロジック例外
export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User not found: ${userId}`);
    this.name = "UserNotFoundError";
  }
}

// Interface層: HTTPステータスへの変換
@Catch(UserNotFoundError)
export class UserNotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: UserNotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    response.status(404).json({
      statusCode: 404,
      message: exception.message,
    });
  }
}
```

---

## 実装例

### 完全な実装例: Product機能

#### 1. Domain Layer

```typescript
// domain/product.entity.ts
export class Product {
  private constructor(
    private readonly id: ProductId,
    private name: ProductName,
    private price: ProductPrice
  ) {}

  static create(name: ProductName, price: ProductPrice): Product {
    return new Product(ProductId.generate(), name, price);
  }

  static reconstruct(id: ProductId, name: ProductName, price: ProductPrice): Product {
    return new Product(id, name, price);
  }

  getId(): ProductId {
    return this.id;
  }
  getName(): ProductName {
    return this.name;
  }
  getPrice(): ProductPrice {
    return this.price;
  }

  updatePrice(newPrice: ProductPrice): void {
    this.price = newPrice;
  }
}

// domain/product-price.vo.ts
export class ProductPrice {
  private constructor(private readonly value: number) {
    this.validate(value);
  }

  static create(price: number): ProductPrice {
    return new ProductPrice(price);
  }

  private validate(price: number): void {
    if (price < 0) {
      throw new Error("Price cannot be negative");
    }
    if (!Number.isInteger(price)) {
      throw new Error("Price must be an integer");
    }
  }

  getValue(): number {
    return this.value;
  }
}

// domain/product.repository.interface.ts
export interface IProductRepository {
  save(product: Product): Promise<void>;
  findById(id: ProductId): Promise<Product | null>;
  findAll(): Promise<Product[]>;
}

export const IProductRepository = Symbol("IProductRepository");
```

#### 2. Application Layer

```typescript
// application/create-product.usecase.ts
@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(IProductRepository)
    private readonly productRepository: IProductRepository
  ) {}

  async execute(name: string, price: number): Promise<ProductId> {
    const productName = ProductName.create(name);
    const productPrice = ProductPrice.create(price);

    const product = Product.create(productName, productPrice);
    await this.productRepository.save(product);

    return product.getId();
  }
}
```

#### 3. Infrastructure Layer

```typescript
// infrastructure/product.repository.ts
@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(product: Product): Promise<void> {
    await this.prisma.product.upsert({
      where: { id: product.getId().getValue() },
      update: {
        name: product.getName().getValue(),
        price: product.getPrice().getValue(),
      },
      create: {
        id: product.getId().getValue(),
        name: product.getName().getValue(),
        price: product.getPrice().getValue(),
      },
    });
  }

  async findById(id: ProductId): Promise<Product | null> {
    const data = await this.prisma.product.findUnique({
      where: { id: id.getValue() },
    });

    if (!data) return null;

    return Product.reconstruct(
      ProductId.create(data.id),
      ProductName.create(data.name),
      ProductPrice.create(data.price)
    );
  }
}
```

#### 4. Interface Layer

```typescript
// interface/dto/create-product.dto.ts
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;
}

// interface/product.controller.ts
@Controller("products")
export class ProductController {
  constructor(private readonly createProductUseCase: CreateProductUseCase) {}

  @Post()
  async create(@Body() dto: CreateProductDto): Promise<{ id: string }> {
    const productId = await this.createProductUseCase.execute(dto.name, dto.price);
    return { id: productId.getValue() };
  }
}
```

#### 5. Module Definition

```typescript
// product.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [
    CreateProductUseCase,
    {
      provide: IProductRepository,
      useClass: ProductRepository,
    },
  ],
})
export class ProductModule {}
```

---

## チェックリスト

新機能実装時は以下を確認:

- [ ] Domain層は他の層に依存していないか
- [ ] Value Objectでバリデーションを実装したか
- [ ] Repository Interfaceはドメイン層に配置したか
- [ ] UseCaseはドメイン層のみに依存しているか
- [ ] Controllerでビジネスロジックを書いていないか
- [ ] DTOとEntityを混同していないか
- [ ] 命名規則に従っているか
- [ ] 各層のテストを書いたか
- [ ] Module定義でDIを正しく設定したか

---

## まとめ

このアーキテクチャは以下を実現します:

1. **ビジネスロジックの保護**: フレームワーク変更の影響を最小化
2. **テスト容易性**: 各層を独立してテスト可能
3. **保守性**: 責務が明確で変更の影響範囲が限定的
4. **拡張性**: 新機能追加が既存コードに影響しにくい

**重要**: 依存の方向を守ることが最も重要です。迷ったら「この層は何を知るべきか」を問いましょう。
