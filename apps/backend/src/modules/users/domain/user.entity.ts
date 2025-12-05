import { ClerkIdVo } from "src/modules/users/domain/clerk-id.vo";
import { AvatarUrlVo } from "src/modules/users/domain/user-avatar-url.vo";
import { IdVo } from "src/modules/users/domain/user-id.vo";
import { NameVo } from "src/modules/users/domain/user-name.vo";

/**
 * ユーザーエンティティ
 */
export class User {
  private constructor(
    private readonly id: IdVo,
    private readonly clerkId: ClerkIdVo,
    private readonly name: NameVo,
    private readonly avatarUrl: AvatarUrlVo
  ) {}

  static reconstruct(id: IdVo, clerkId: ClerkIdVo, name: NameVo, avatarUrl: AvatarUrlVo): User {
    return new User(id, clerkId, name, avatarUrl);
  }

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
