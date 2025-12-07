# API Endpoints Documentation

## 📋 目次

- [認証](#認証)
- [Webhooks](#webhooks)
- [Users](#users)
- [Groups](#groups)
- [Group Members](#group-members)
- [Channels](#channels)
- [Messages](#messages)
- [Topics](#topics)
- [Topic Messages](#topic-messages)
- [Debate Analyses](#debate-analyses)
- [Minutes](#minutes)
- [データ型定義](#データ型定義)
- [エラーレスポンス](#エラーレスポンス)

---

## 認証

すべてのAPIエンドポイント（Webhooks除く）は認証が必要です。

### 認証方法

```http
Authorization: Bearer <Clerk JWT Token>
```

`<Clerk JWT Token>` はClerkから発行されるJWTトークンを使用してください。

---

## Webhooks

### Clerk User Webhook

ユーザー作成・更新時にClerkから送信されるWebhook
signature（svix）検証は必須です。

```http
POST /webhooks/clerk/users
```

#### Headers

```
Content-Type: application/json
```

#### Request Body

| Field            | Type   | Required | Description         |
| ---------------- | ------ | -------- | ------------------- |
| `type`           | string | Yes      | Webhookの種類       |
| `data`           | object | Yes      | ユーザーデータ      |
| `data.id`        | string | Yes      | ClerkのユーザーID   |
| `data.username`  | string | Yes      | ユーザー名          |
| `data.image_url` | string | Yes      | プロフィール画像URL |

```json
{
  "type": "user.created",
  "data": {
    "id": "user_2abc123def456",
    "username": "john_doe",
    "image_url": "https://example.com/avatar.jpg"
  }
}
```

---

## Groups

### グループ一覧取得

ユーザーが所属するグループの一覧を取得します。

```http
GET /api/groups
```

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
```

#### Response

| Field                  | Type             | Description    |
| ---------------------- | ---------------- | -------------- |
| `groups`               | array            | グループの配列 |
| `groups[].id`          | string (uuid v4) | グループID     |
| `groups[].name`        | string           | グループ名     |
| `groups[].description` | string           | グループの説明 |

```json
{
  "groups": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "開発チーム",
      "description": "プロジェクトの開発メンバー"
    }
  ]
}
```

---

### グループ作成

新しいグループを作成します。

```http
POST /api/groups
```

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

#### Request Body

| Field         | Type   | Required | Description                 |
| ------------- | ------ | -------- | --------------------------- |
| `name`        | string | Yes      | グループ名（1-100文字）     |
| `description` | string | Yes      | グループの説明（0-500文字） |

```json
{
  "name": "開発チーム",
  "description": "プロジェクトの開発メンバー"
}
```

#### Response

| Field         | Type             | Description          |
| ------------- | ---------------- | -------------------- |
| `id`          | string (uuid v4) | 作成されたグループID |
| `name`        | string           | グループ名           |
| `description` | string           | グループの説明       |

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "開発チーム",
  "description": "プロジェクトの開発メンバー"
}
```

---

### グループ詳細取得

指定したグループの詳細情報を取得します。

```http
GET /api/groups/:group_id
```

#### Path Parameters

| Parameter  | Type             | Description |
| ---------- | ---------------- | ----------- |
| `group_id` | string (uuid v4) | グループID  |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
```

#### Response

| Field         | Type             | Description    |
| ------------- | ---------------- | -------------- |
| `id`          | string (uuid v4) | グループID     |
| `name`        | string           | グループ名     |
| `description` | string           | グループの説明 |

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "開発チーム",
  "description": "プロジェクトの開発メンバー"
}
```

---

### グループ更新

グループの情報を更新します。

```http
PATCH /api/groups/:group_id
```

#### Path Parameters

| Parameter  | Type             | Description |
| ---------- | ---------------- | ----------- |
| `group_id` | string (uuid v4) | グループID  |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

#### Request Body

| Field         | Type           | Required | Description          |
| ------------- | -------------- | -------- | -------------------- |
| `name`        | string \| null | No       | 新しいグループ名     |
| `description` | string \| null | No       | 新しいグループの説明 |

```json
{
  "name": "バックエンドチーム",
  "description": "バックエンド開発メンバー"
}
```

#### Response

| Field         | Type             | Description              |
| ------------- | ---------------- | ------------------------ |
| `id`          | string (uuid v4) | グループID               |
| `name`        | string           | 更新されたグループ名     |
| `description` | string           | 更新されたグループの説明 |

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "バックエンドチーム",
  "description": "バックエンド開発メンバー"
}
```

---

### グループ削除

グループを削除します。

```http
DELETE /api/groups/:group_id
```

#### Path Parameters

| Parameter  | Type             | Description |
| ---------- | ---------------- | ----------- |
| `group_id` | string (uuid v4) | グループID  |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

---

## Group Members

### グループメンバー一覧取得

グループに所属するメンバーの一覧を取得します。削除済み（`deleted`）のメンバーは含まれません。

```http
GET /api/groups/:group_id/members
```

#### Path Parameters

| Parameter  | Type             | Description |
| ---------- | ---------------- | ----------- |
| `group_id` | string (uuid v4) | グループID  |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
```

#### Response

| Field                             | Type             | Description                                 |
| --------------------------------- | ---------------- | ------------------------------------------- |
| `group_members`                   | array            | メンバーの配列                              |
| `group_members[].id`              | string (uuid v4) | メンバーシップID                            |
| `group_members[].status`          | enum(string)     | メンバーのステータス（`invited`, `active`） |
| `group_members[].user`            | object           | ユーザー情報                                |
| `group_members[].user.id`         | string (uuid v4) | ユーザーID                                  |
| `group_members[].user.name`       | string           | ユーザー名                                  |
| `group_members[].user.avatar_url` | string (URL)     | プロフィール画像URL                         |

```json
{
  "group_members": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "status": "active",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg"
      }
    }
  ]
}
```

---

### メンバー招待

グループに新しいメンバーを招待します。招待されたメンバーのステータスは `invited` になります。

```http
POST /api/groups/:group_id/members
```

#### Path Parameters

| Parameter  | Type             | Description |
| ---------- | ---------------- | ----------- |
| `group_id` | string (uuid v4) | グループID  |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

#### Request Body

| Field     | Type             | Required | Description          |
| --------- | ---------------- | -------- | -------------------- |
| `user_id` | string (uuid v4) | Yes      | 招待するユーザーのID |

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Response

| Field             | Type             | Description                                |
| ----------------- | ---------------- | ------------------------------------------ |
| `id`              | string (uuid v4) | メンバーシップID                           |
| `status`          | string           | メンバーのステータス（招待時は `invited`） |
| `user`            | object           | ユーザー情報                               |
| `user.id`         | string (uuid v4) | ユーザーID                                 |
| `user.name`       | string           | ユーザー名                                 |
| `user.avatar_url` | string (URL)     | プロフィール画像URL                        |

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "status": "invited",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```

---

### メンバーステータス更新

メンバーのステータスを更新します（招待の承認・拒否など）。

```http
PATCH /api/groups/:group_id/members/:member_id
```

#### Path Parameters

| Parameter   | Type             | Description      |
| ----------- | ---------------- | ---------------- |
| `group_id`  | string (uuid v4) | グループID       |
| `member_id` | string (uuid v4) | メンバーシップID |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

#### Request Body

| Field    | Type         | Required | Description                                        |
| -------- | ------------ | -------- | -------------------------------------------------- |
| `status` | enum(string) | Yes      | 新しいステータス（`invited`, `active`, `deleted`） |

```json
{
  "status": "active"
}
```

#### Response

| Field             | Type             | Description          |
| ----------------- | ---------------- | -------------------- |
| `id`              | string (uuid v4) | メンバーシップID     |
| `status`          | enum(string)     | 更新されたステータス |
| `user`            | object           | ユーザー情報         |
| `user.id`         | string (uuid v4) | ユーザーID           |
| `user.name`       | string           | ユーザー名           |
| `user.avatar_url` | string (URL)     | プロフィール画像URL  |

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "status": "active",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```

---

### メンバー削除

グループからメンバーを削除します（Soft Delete）。

```http
DELETE /api/groups/:group_id/members/:member_id
```

#### Path Parameters

| Parameter   | Type             | Description      |
| ----------- | ---------------- | ---------------- |
| `group_id`  | string (uuid v4) | グループID       |
| `member_id` | string (uuid v4) | メンバーシップID |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

---

## Channels

### チャンネル一覧取得

グループ内のチャンネル一覧を取得します。

```http
GET /api/groups/:group_id/channels
```

#### Path Parameters

| Parameter  | Type             | Description |
| ---------- | ---------------- | ----------- |
| `group_id` | string (uuid v4) | グループID  |

#### Query Parameters

| Parameter | Type         | Required | Description                                  |
| --------- | ------------ | -------- | -------------------------------------------- |
| `status`  | enum(string) | No       | ステータスでフィルタリング。省略時は全件取得 |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
```

#### Response

| Field                     | Type             | Description                              |
| ------------------------- | ---------------- | ---------------------------------------- |
| `channels`                | array            | チャンネルの配列                         |
| `channels[].id`           | string (uuid v4) | チャンネルID                             |
| `channels[].name`         | string           | チャンネル名                             |
| `channels[].channel_type` | enum(string)     | チャンネルタイプ（`chat`, `discussion`） |
| `channels[].owner_id`     | string (uuid v4) | 作成者のユーザーID                       |

```json
{
  "channels": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "general",
      "channel_type": "chat",
      "owner_id": "550e8400-e29b-41d4-a716-446655440000"
    }
  ]
}
```

---

### チャンネル作成

新しいチャンネルを作成します。

```http
POST /api/groups/:group_id/channels
```

#### Path Parameters

| Parameter  | Type             | Description |
| ---------- | ---------------- | ----------- |
| `group_id` | string (uuid v4) | グループID  |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

#### Request Body

| Field          | Type         | Required | Description                              |
| -------------- | ------------ | -------- | ---------------------------------------- |
| `name`         | string       | Yes      | チャンネル名（1-50文字）                 |
| `channel_type` | enum(string) | Yes      | チャンネルタイプ（`chat`, `discussion`） |

```json
{
  "name": "general",
  "channel_type": "chat"
}
```

#### Response

| Field          | Type             | Description            |
| -------------- | ---------------- | ---------------------- |
| `id`           | string (uuid v4) | 作成されたチャンネルID |
| `name`         | string           | チャンネル名           |
| `channel_type` | enum(string)     | チャンネルタイプ       |
| `owner_id`     | string (uuid v4) | 作成者のユーザーID     |

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "name": "general",
  "channel_type": "chat",
  "owner_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### チャンネル更新

チャンネルの情報を更新します。

```http
PATCH /api/groups/:group_id/channels/:channel_id
```

#### Path Parameters

| Parameter    | Type             | Description  |
| ------------ | ---------------- | ------------ |
| `group_id`   | string (uuid v4) | グループID   |
| `channel_id` | string (uuid v4) | チャンネルID |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

#### Request Body

| Field          | Type                 | Required | Description            |
| -------------- | -------------------- | -------- | ---------------------- |
| `name`         | string \| null       | No       | 新しいチャンネル名     |
| `channel_type` | enum(string) \| null | No       | 新しいチャンネルタイプ |

```json
{
  "name": "announcements",
  "channel_type": "chat"
}
```

#### Response

| Field          | Type             | Description                |
| -------------- | ---------------- | -------------------------- |
| `id`           | string (uuid v4) | チャンネルID               |
| `name`         | string           | 更新されたチャンネル名     |
| `channel_type` | enum(string)     | 更新されたチャンネルタイプ |
| `owner_id`     | string (uuid v4) | 作成者のユーザーID         |

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "name": "announcements",
  "channel_type": "chat"
}
```

---

### チャンネル削除

チャンネルを削除します。

```http
DELETE /api/groups/:group_id/channels/:channel_id
```

#### Path Parameters

| Parameter    | Type             | Description  |
| ------------ | ---------------- | ------------ |
| `group_id`   | string (uuid v4) | グループID   |
| `channel_id` | string (uuid v4) | チャンネルID |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

---

## Messages

### メッセージ一覧取得

チャンネル内のメッセージ一覧を取得します。

```http
GET /api/groups/:group_id/channels/:channel_id/messages
```

#### Path Parameters

| Parameter    | Type             | Description  |
| ------------ | ---------------- | ------------ |
| `group_id`   | string (uuid v4) | グループID   |
| `channel_id` | string (uuid v4) | チャンネルID |

#### Query Parameters

| Parameter  | Type             | Required | Description                |
| ---------- | ---------------- | -------- | -------------------------- |
| `topic_id` | string (uuid v4) | No       | トピックIDでフィルタリング |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
```

#### Response

| Field                          | Type                     | Description                                               |
| ------------------------------ | ------------------------ | --------------------------------------------------------- |
| `messages`                     | array                    | メッセージの配列                                          |
| `messages[].id`                | string (uuid v4)         | メッセージID                                              |
| `messages[].parent_id`         | string (uuid v4) \| null | 親メッセージID（スレッドの場合）                          |
| `messages[].content`           | string                   | メッセージ本文                                            |
| `messages[].type`              | enum(string)             | メッセージタイプ（`normal`, `thread`, `reply`, `system`） |
| `messages[].status`            | enum(string)             | メッセージステータス（`normal`, `deleted`, `edited`）     |
| `messages[].created_at`        | timestamp                | 作成日時                                                  |
| `messages[].thread_count`      | int                      | スレッド内のメッセージ数                                  |
| `messages[].thread_messages`   | array                    | スレッドメッセージの配列                                  |
| `messages[].reply_message`     | object \| null           | 返信元メッセージ情報                                      |
| `messages[].sender`            | object                   | 送信者情報                                                |
| `messages[].sender.id`         | string (uuid v4)         | 送信者のユーザーID                                        |
| `messages[].sender.name`       | string                   | 送信者の名前                                              |
| `messages[].sender.avatar_url` | string (URL)             | 送信者のプロフィール画像URL                               |

```json
{
  "messages": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "parent_id": null,
      "content": "こんにちは",
      "type": "normal",
      "status": "normal",
      "created_at": "2024-01-15T12:30:45.123Z",
      "thread_count": 2,
      "thread_messages": [],
      "reply_message": null,
      "sender": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg"
      }
    }
  ]
}
```

#### Note

- `type` が `thread` の場合、メッセージは `messages` ではなく `thread_messages` に含まれます

---

### メッセージ作成

新しいメッセージを投稿します。

```http
POST /api/groups/:group_id/channels/:channel_id/messages
```

#### Path Parameters

| Parameter    | Type             | Description  |
| ------------ | ---------------- | ------------ |
| `group_id`   | string (uuid v4) | グループID   |
| `channel_id` | string (uuid v4) | チャンネルID |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

#### Request Body

| Field       | Type                     | Required | Description                                               |
| ----------- | ------------------------ | -------- | --------------------------------------------------------- |
| `parent_id` | string (uuid v4) \| null | No       | 親メッセージID（スレッドに返信する場合）                  |
| `content`   | string                   | Yes      | メッセージ本文（1-2000文字）                              |
| `type`      | enum(string)             | Yes      | メッセージタイプ（`normal`, `thread`, `reply`, `system`） |
| `status`    | enum(string)             | Yes      | メッセージステータス（`normal`）                          |

```json
{
  "parent_id": null,
  "content": "こんにちは",
  "type": "normal",
  "status": "normal"
}
```

#### Response

| Field             | Type                     | Description              |
| ----------------- | ------------------------ | ------------------------ |
| `id`              | string (uuid v4)         | 作成されたメッセージID   |
| `parent_id`       | string (uuid v4) \| null | 親メッセージID           |
| `content`         | string                   | メッセージ本文           |
| `type`            | enum(string)             | メッセージタイプ         |
| `status`          | enum(string)             | メッセージステータス     |
| `created_at`      | timestamp                | 作成日時                 |
| `thread_count`    | int                      | スレッド内のメッセージ数 |
| `thread_messages` | array                    | スレッドメッセージの配列 |
| `reply_message`   | object \| null           | 返信元メッセージ情報     |
| `sender`          | object                   | 送信者情報               |

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "parent_id": null,
  "content": "こんにちは",
  "type": "normal",
  "status": "normal",
  "created_at": "2024-01-15T12:30:45.123Z",
  "thread_count": 0,
  "thread_messages": [],
  "reply_message": null,
  "sender": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```

---

### メッセージ更新

メッセージを編集します。

```http
PATCH /api/groups/:group_id/channels/:channel_id/messages/:message_id
```

#### Path Parameters

| Parameter    | Type             | Description  |
| ------------ | ---------------- | ------------ |
| `group_id`   | string (uuid v4) | グループID   |
| `channel_id` | string (uuid v4) | チャンネルID |
| `message_id` | string (uuid v4) | メッセージID |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

#### Request Body

| Field       | Type                     | Required | Description          |
| ----------- | ------------------------ | -------- | -------------------- |
| `parent_id` | string (uuid v4) \| null | No       | 親メッセージID       |
| `content`   | string                   | No       | 新しいメッセージ本文 |
| `type`      | enum(string)             | No       | メッセージタイプ     |
| `status`    | enum(string)             | No       | メッセージステータス |

```json
{
  "content": "こんにちは（編集済み）"
}
```

#### Response

メッセージ作成時と同じレスポンス形式

---

### メッセージ削除

メッセージを削除します（Soft Delete）。

```http
DELETE /api/groups/:group_id/channels/:channel_id/messages/:message_id
```

#### Path Parameters

| Parameter    | Type             | Description  |
| ------------ | ---------------- | ------------ |
| `group_id`   | string (uuid v4) | グループID   |
| `channel_id` | string (uuid v4) | チャンネルID |
| `message_id` | string (uuid v4) | メッセージID |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

---

## Topics

### トピック一覧取得

チャンネル内のトピック一覧を取得します。

```http
GET /api/groups/:group_id/channels/:channel_id/topics
```

#### Path Parameters

| Parameter    | Type             | Description  |
| ------------ | ---------------- | ------------ |
| `group_id`   | string (uuid v4) | グループID   |
| `channel_id` | string (uuid v4) | チャンネルID |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

#### Response

| Field                      | Type             | Description          |
| -------------------------- | ---------------- | -------------------- |
| `topics`                   | array            | トピックの配列       |
| `topics[].id`              | string (uuid v4) | トピックID           |
| `topics[].title`           | string           | トピックのタイトル   |
| `topics[].description`     | string           | トピックの説明       |
| `topics[].status`          | enum(string)     | トピックのステータス |
| `topics[].debate_analyses` | array            | 議論分析の配列       |

```json
{
  "topics": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "title": "新機能の提案",
      "description": "ユーザー管理機能について",
      "status": "active",
      "debate_analyses": []
    }
  ]
}
```

---

### トピック作成

新しいトピックを作成します。

```http
POST /api/groups/:group_id/channels/:channel_id/topics
```

#### Path Parameters

| Parameter    | Type             | Description  |
| ------------ | ---------------- | ------------ |
| `group_id`   | string (uuid v4) | グループID   |
| `channel_id` | string (uuid v4) | チャンネルID |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

#### Request Body

| Field         | Type   | Required | Description                     |
| ------------- | ------ | -------- | ------------------------------- |
| `title`       | string | Yes      | トピックのタイトル（1-200文字） |
| `description` | string | Yes      | トピックの説明（0-1000文字）    |

```json
{
  "title": "新機能の提案",
  "description": "ユーザー管理機能について"
}
```

#### Response

| Field         | Type             | Description          |
| ------------- | ---------------- | -------------------- |
| `id`          | string (uuid v4) | 作成されたトピックID |
| `title`       | string           | トピックのタイトル   |
| `description` | string           | トピックの説明       |
| `status`      | enum(string)     | トピックのステータス |

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "title": "新機能の提案",
  "description": "ユーザー管理機能について",
  "status": "active"
}
```

---

### トピック詳細取得

指定したトピックの詳細情報を取得します。

```http
GET /api/groups/:group_id/channels/:channel_id/topics/:topic_id
```

#### Path Parameters

| Parameter    | Type             | Description  |
| ------------ | ---------------- | ------------ |
| `group_id`   | string (uuid v4) | グループID   |
| `channel_id` | string (uuid v4) | チャンネルID |
| `topic_id`   | string (uuid v4) | トピックID   |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
```

#### Response

| Field                           | Type             | Description                                                       |
| ------------------------------- | ---------------- | ----------------------------------------------------------------- |
| `id`                            | string (uuid v4) | トピックID                                                        |
| `title`                         | string           | トピックのタイトル                                                |
| `description`                   | string           | トピックの説明                                                    |
| `status`                        | enum(string)     | トピックのステータス                                              |
| `debate_analyses`               | array            | 議論分析の配列                                                    |
| `debate_analyses[].id`          | string (uuid v4) | 議論分析ID                                                        |
| `debate_analyses[].content`     | string           | 分析内容                                                          |
| `debate_analyses[].alert_level` | enum(string)     | アラートレベル（`none`, `info`, `notice`, `warning`, `critical`） |
| `debate_analyses[].created_at`  | timestamp        | 作成日時                                                          |

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "title": "新機能の提案",
  "description": "ユーザー管理機能について",
  "status": "active",
  "debate_analyses": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440006",
      "content": "議論が活発です",
      "alert_level": "info"
    }
  ]
}
```

---

### トピック更新

トピックの情報を更新します。

```http
PATCH /api/groups/:group_id/channels/:channel_id/topics/:topic_id
```

#### Path Parameters

| Parameter    | Type             | Description  |
| ------------ | ---------------- | ------------ |
| `group_id`   | string (uuid v4) | グループID   |
| `channel_id` | string (uuid v4) | チャンネルID |
| `topic_id`   | string (uuid v4) | トピックID   |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

#### Request Body

| Field         | Type   | Required | Description              |
| ------------- | ------ | -------- | ------------------------ |
| `title`       | string | No       | 新しいトピックのタイトル |
| `description` | string | No       | 新しいトピックの説明     |

```json
{
  "title": "新機能の提案（更新）",
  "description": "ユーザー管理機能について（詳細追加）"
}
```

#### Response

トピック詳細取得と同じレスポンス形式

---

### トピック削除

トピックを削除します。

```http
DELETE /api/groups/:group_id/channels/:channel_id/topics/:topic_id
```

#### Path Parameters

| Parameter    | Type             | Description  |
| ------------ | ---------------- | ------------ |
| `group_id`   | string (uuid v4) | グループID   |
| `channel_id` | string (uuid v4) | チャンネルID |
| `topic_id`   | string (uuid v4) | トピックID   |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

---

## Topic Messages

### トピック内メッセージ一覧取得

トピックに関連するメッセージ一覧を取得します。

```http
GET /api/groups/:group_id/channels/:channel_id/topics/:topic_id/messages
```

#### Path Parameters

| Parameter    | Type             | Description  |
| ------------ | ---------------- | ------------ |
| `group_id`   | string (uuid v4) | グループID   |
| `channel_id` | string (uuid v4) | チャンネルID |
| `topic_id`   | string (uuid v4) | トピックID   |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
```

#### Response

メッセージ一覧取得と同じレスポンス形式

---

### トピック内メッセージ作成

トピックに関連するメッセージを投稿します。

```http
POST /api/groups/:group_id/channels/:channel_id/topics/:topic_id/messages
```

#### Path Parameters

| Parameter    | Type             | Description  |
| ------------ | ---------------- | ------------ |
| `group_id`   | string (uuid v4) | グループID   |
| `channel_id` | string (uuid v4) | チャンネルID |
| `topic_id`   | string (uuid v4) | トピックID   |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

#### Request Body

メッセージ作成と同じリクエスト形式

#### Response

メッセージ作成と同じレスポンス形式

---

### トピック内メッセージ更新

トピック内のメッセージを編集します。

```http
PATCH /api/groups/:group_id/channels/:channel_id/topics/:topic_id/messages/:message_id
```

#### Path Parameters

| Parameter    | Type             | Description  |
| ------------ | ---------------- | ------------ |
| `group_id`   | string (uuid v4) | グループID   |
| `channel_id` | string (uuid v4) | チャンネルID |
| `topic_id`   | string (uuid v4) | トピックID   |
| `message_id` | string (uuid v4) | メッセージID |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

#### Request Body

メッセージ更新と同じリクエスト形式

#### Response

メッセージ作成と同じレスポンス形式

---

## Debate Analyses

### 議論分析作成

トピックの議論分析を作成します。

```http
POST /api/groups/:group_id/channels/:channel_id/topics/:topic_id/debate_analyses
```

#### Path Parameters

| Parameter    | Type             | Description  |
| ------------ | ---------------- | ------------ |
| `group_id`   | string (uuid v4) | グループID   |
| `channel_id` | string (uuid v4) | チャンネルID |
| `topic_id`   | string (uuid v4) | トピックID   |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

#### Request Body

| Field         | Type         | Required | Description                                                       |
| ------------- | ------------ | -------- | ----------------------------------------------------------------- |
| `content`     | string       | Yes      | 分析内容（1-2000文字）                                            |
| `alert_level` | enum(string) | Yes      | アラートレベル（`none`, `info`, `notice`, `warning`, `critical`） |

```json
{
  "content": "議論が活発です",
  "alert_level": "info"
}
```

#### Response

| Field         | Type             | Description          |
| ------------- | ---------------- | -------------------- |
| `id`          | string (uuid v4) | 作成された議論分析ID |
| `content`     | string           | 分析内容             |
| `is_solved`   | boolean          | 解決済みかどうか     |
| `alert_level` | enum(string)     | アラートレベル       |

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "content": "議題から脱線しています",
  "is_solved": false,
  "alert_level": "warning"
}
```

---

### 議論分析更新

議論分析を更新します。

```http
PATCH /api/groups/:group_id/channels/:channel_id/topics/:topic_id/debate_analyses/:debate_analysis_id
```

#### Path Parameters

| Parameter            | Type             | Description  |
| -------------------- | ---------------- | ------------ |
| `group_id`           | string (uuid v4) | グループID   |
| `channel_id`         | string (uuid v4) | チャンネルID |
| `topic_id`           | string (uuid v4) | トピックID   |
| `debate_analysis_id` | string (uuid v4) | 議論分析ID   |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

#### Request Body

| Field         | Type                 | Required | Description          |
| ------------- | -------------------- | -------- | -------------------- |
| `content`     | string \| null       | No       | 新しい分析内容       |
| `is_solved`   | bool \| null         | No       | 解決済みかどうか     |
| `alert_level` | enum(string) \| null | No       | 新しいアラートレベル |

```json
{
  "content": "議論が非常に活発です",
  "alert_level": "notice"
}
```

#### Response

議論分析作成と同じレスポンス形式

---

### 議論分析削除

議論分析を削除します（Soft Delete）。

```http
DELETE /api/groups/:group_id/channels/:channel_id/topics/:topic_id/debate_analyses/:debate_analysis_id
```

#### Path Parameters

| Parameter            | Type             | Description  |
| -------------------- | ---------------- | ------------ |
| `group_id`           | string (uuid v4) | グループID   |
| `channel_id`         | string (uuid v4) | チャンネルID |
| `topic_id`           | string (uuid v4) | トピックID   |
| `debate_analysis_id` | string (uuid v4) | 議論分析ID   |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

---

## Minutes

### 議事録一覧取得

グループ内の議事録一覧を取得します。

```http
GET /api/groups/:group_id/minutes
```

#### Path Parameters

| Parameter  | Type             | Description |
| ---------- | ---------------- | ----------- |
| `group_id` | string (uuid v4) | グループID  |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
```

#### Response

| Field                  | Type             | Description  |
| ---------------------- | ---------------- | ------------ |
| `minutes`              | array            | 議事録の配列 |
| `minutes[].id`         | string (uuid v4) | 議事録ID     |
| `minutes[].content`    | string           | 議事録の内容 |
| `minutes[].conclusion` | string           | 結論・まとめ |

```json
{
  "minutes": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440007",
      "content": "会議の議事録",
      "conclusion": "次回までに実装する"
    }
  ]
}
```

---

### 議事録詳細取得

指定した議事録の詳細情報を取得します。

```http
GET /api/groups/:group_id/minutes/:minutes_id
```

#### Path Parameters

| Parameter    | Type             | Description |
| ------------ | ---------------- | ----------- |
| `group_id`   | string (uuid v4) | グループID  |
| `minutes_id` | string (uuid v4) | 議事録ID    |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
```

#### Response

| Field        | Type             | Description          |
| ------------ | ---------------- | -------------------- |
| `id`         | string (uuid v4) | 議事録ID             |
| `channel_id` | string (uuid v4) | 関連するチャンネルID |
| `content`    | string           | 議事録の内容         |
| `conclusion` | string           | 結論・まとめ         |

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440007",
  "channel_id": "550e8400-e29b-41d4-a716-446655440003",
  "content": "会議の議事録",
  "conclusion": "次回までに実装する"
}
```

---

### 議事録更新

議事録の結論を更新します。

```http
PATCH /api/groups/:group_id/minutes/:minutes_id
```

#### Path Parameters

| Parameter    | Type             | Description |
| ------------ | ---------------- | ----------- |
| `group_id`   | string (uuid v4) | グループID  |
| `minutes_id` | string (uuid v4) | 議事録ID    |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

#### Request Body

| Field        | Type   | Required | Description                      |
| ------------ | ------ | -------- | -------------------------------- |
| `conclusion` | string | Yes      | 新しい結論・まとめ（0-2000文字） |

```json
{
  "conclusion": "次回までに実装する（期限: 1週間）"
}
```

#### Response

| Field        | Type             | Description            |
| ------------ | ---------------- | ---------------------- |
| `id`         | string (uuid v4) | 議事録ID               |
| `content`    | string           | 議事録の内容           |
| `conclusion` | string           | 更新された結論・まとめ |

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440007",
  "content": "会議の議事録",
  "conclusion": "次回までに実装する（期限: 1週間）"
}
```

---

### 議事録削除

議事録を削除します。

```http
DELETE /api/groups/:group_id/minutes/:minutes_id
```

#### Path Parameters

| Parameter    | Type             | Description |
| ------------ | ---------------- | ----------- |
| `group_id`   | string (uuid v4) | グループID  |
| `minutes_id` | string (uuid v4) | 議事録ID    |

#### Headers

```
Authorization: Bearer <Clerk JWT Token>
Content-Type: application/json
```

---

## データ型定義

### UUID v4

ユニバーサル一意識別子（バージョン4）

```
形式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
例: "550e8400-e29b-41d4-a716-446655440000"
```

### Timestamp

ISO 8601形式の日時

```
形式: YYYY-MM-DDTHH:mm:ss.sssZ
例: "2024-01-15T12:30:45.123Z"
```

### URL

有効なHTTP/HTTPS URL

```
例: "https://example.com/image.jpg"
```

### Enum Types

#### Message Type

メッセージの種類

- `normal`: 通常メッセージ
- `thread`: スレッド
- `reply`: リプライ
- `system`: システムメッセージ

#### Message Status

メッセージの状態

- `normal`: 通常
- `deleted`: 削除済み
- `edited`: 編集済み

#### Channel Type

チャンネルの種類

- `chat`: 雑談
- `discussion`: 議論

#### Member Status

メンバーの状態

- `invited`: 招待中
- `active`: 正常
- `deleted`: 強制退出
- `left`: 退出
- `block`: ブロック

#### Topic Status

トピックの状態

- `ready`: 準備中
- `active`: 議論中
- `stopped`: 一時停止
- `closed`: 終了

#### Alert Level

アラートの重要度

- `none`: 問題なし
- `info`: 軽微な注意
- `notice`: やや論点ズレ・停滞
- `warning`: 明確な問題
- `critical`: 重大な問題

---

### HTTPステータスコード

| Code | Name                  | Description                      | 例                                 |
| ---- | --------------------- | -------------------------------- | ---------------------------------- |
| 200  | OK                    | リクエスト成功                   | データ取得成功                     |
| 201  | Created               | リソース作成成功                 | グループ作成成功                   |
| 204  | No Content            | 削除成功（レスポンスボディなし） | メッセージ削除成功                 |
| 400  | Bad Request           | リクエストが不正                 | バリデーションエラー               |
| 401  | Unauthorized          | 認証エラー                       | トークンが無効                     |
| 403  | Forbidden             | 権限エラー                       | アクセス権限がない                 |
| 404  | Not Found             | リソースが存在しない             | 指定されたIDのグループが存在しない |
| 500  | Internal Server Error | サーバー内部エラー               | データベース接続エラー             |
