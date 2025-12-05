import { SaveUserVo } from "src/modules/users/domain/save-user.vo";
import { User } from "src/modules/users/domain/user.entity";

/**
 * ユーザーリポジトリのトークン
 */
export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

/**
 * ユーザーリポジトリのインターフェース
 */
export interface IUserRepository {
  create(user: SaveUserVo): Promise<User>;
  update(user: SaveUserVo): Promise<User>;
}
