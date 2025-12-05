import { ClerkIdVo } from "src/modules/users/domain/clerk-id.vo";
import { AvatarUrlVo } from "src/modules/users/domain/user-avatar-url.vo";
import { NameVo } from "src/modules/users/domain/user-name.vo";

/**
 * ユーザー保存用のValue Object
 */
export class SaveUserVo {
  private constructor(
    private readonly clerkId: ClerkIdVo,
    private readonly name: NameVo,
    private readonly avatarUrl: AvatarUrlVo
  ) {}

  static create(clerkId: ClerkIdVo, name: NameVo, avatarUrl: AvatarUrlVo): SaveUserVo {
    return new SaveUserVo(clerkId, name, avatarUrl);
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
