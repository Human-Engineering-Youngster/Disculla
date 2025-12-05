import { User } from "src/modules/users/domain/user.entity";

export interface UsersResponse {
  id: string;
  clerkId: string;
  name: string;
  avatarUrl: string;
}

export class UserMapper {
  /**
   * ユーザーエンティティをレスポンスオブジェクトに変換します。
   * @param {User} user - ユーザーエンティティ
   * @returns {UsersResponse} ユーザーのレスポンスオブジェクト
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
