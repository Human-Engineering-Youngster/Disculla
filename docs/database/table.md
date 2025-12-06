# DB設計

## テーブル設計

### Clerk Users（外部）

| column | type    | key | 補足 |
| ------ | ------- | --- | ---- |
| id     | uuid v4 | PK  |      |
| name   | string  |     |      |
| email  | email   |     |      |
| etc..  |         |     |      |

### Users

| column     | type        | key | 補足                  |
| ---------- | ----------- | --- | --------------------- |
| id         | uuid v4     | PK  |                       |
| clerk_id   | uuid v4     |     | ClerkのWeb Hookで追加 |
| name       | string      |     | ClerkのWeb Hookで追加 |
| avatar_url | string(url) |     | ClerkのWeb Hookで追加 |
| created_at | timestamp   |     |                       |
| updated_at | timestamp   |     |                       |

### Groups

| column      | type      | key | 補足 |
| ----------- | --------- | --- | ---- |
| id          | uuid v4   | PK  |      |
| name        | string    |     |      |
| description | string    |     |      |
| created_at  | timestamp |     |      |
| updated_at  | timestamp |     |      |

### Group Members

| column              | type               | key | 補足      |
| ------------------- | ------------------ | --- | --------- |
| id                  | uuid v4            | PK  |           |
| group_id            | uuid v4            | FK  | groups.id |
| user_id             | uuid v4            | FK  | users.id  |
| status              | GroupMembersStatus |     |           |
| created_at          | timestamp          |     |           |
| updated_at          | timestamp          |     |           |
| (group_id, user_id) | index, unique      |     | 複合 key  |

### Channels

| column       | type        | key | 補足      |
| ------------ | ----------- | --- | --------- |
| id           | uuid v4     | PK  |           |
| owner_id     | uuid v4     | FK  | users.id  |
| group_id     | uuid v4     | FK  | groups.id |
| name         | string      |     |           |
| channel_type | ChannelType |     |           |
| created_at   | timestamp   |     |           |
| updated_at   | timestamp   |     |           |

### Messages

| column     | type          | key | 補足        |
| ---------- | ------------- | --- | ----------- |
| id         | uuid v4       | PK  |             |
| channel_id | uuid v4       | FK  | channels.id |
| sender_id  | uuid v4       | FK  | users.id    |
| parent_id  | uuid v4       | FK  | messages.id |
| content    | string        |     |             |
| type       | MessageType   |     |             |
| status     | MessageStatus |     |             |
| created_at | timestamp     |     |             |
| updated_at | timestamp     |     |             |

### Minutes

| column     | type      | key | 補足         |
| ---------- | --------- | --- | ------------ |
| id         | uuid v4   | PK  |              |
| channel_id | uuid v4   | FK  | channels.id  |
| content    | string    |     |              |
| conclusion | string    |     | 最終的な結論 |
| created_at | timestamp |     |              |
| updated_at | timestamp |     |              |

### Topics

| column      | type        | key | 補足        |
| ----------- | ----------- | --- | ----------- |
| id          | uuid v4     | PK  |             |
| channel_id  | uuid v4     | FK  | channels.id |
| title       | string      |     |             |
| description | string      |     |             |
| status      | TopicStatus |     |             |
| created_at  | timestamp   |     |             |
| updated_at  | timestamp   |     |             |

### Debate Analyses

| column      | type       | key | 補足      |
| ----------- | ---------- | --- | --------- |
| id          | uuid v4    | PK  |           |
| topic_id    | uuid v4    | FK  | topics.id |
| content     | string     |     |           |
| is_solved   | bool       |     |           |
| alert_level | AlertLevel |     | 警告度    |
| created_at  | timestamp  |     |           |
| updated_at  | timestamp  |     |           |

### Debate Summaries

| column             | type      | key | 補足               |
| ------------------ | --------- | --- | ------------------ |
| id                 | uuid v4   | PK  |                    |
| debate_analysis_id | uuid v4   | FK  | debate_analyses.id |
| summary            | string    |     |                    |
| created_at         | timestamp |     |                    |
| updated_at         | timestamp |     |                    |

## 列挙型(enum)一覧

### Group Member Status

- **invited**: 招待中
- **deleted**: 強制退出
- **active**: 正常
- **left**: 退出
- **block**: ブロック

### Channel Type

- **chat**: 雑談
- **discussion**: 議論

### Message Type

- **normal**: 通常メッセージ
- **thread**: スレッド
- **reply**: リプライ
- **system**: システムメッセージ

### Message Status

- **normal**: 通常
- **deleted**: 削除済み
- **edited**: 編集済み

### Topic Status

- **ready**: 準備中
- **active**: 議論中
- **stopped**: 一時停止
- **closed**: 終了

### Alert Level

- **none**: 問題なし
- **info**: 軽微な注意
- **notice**: やや論点ズレ・停滞
- **warning**: 明確な問題
- **critical**: 重大な問題
