import { Injectable } from "@nestjs/common";

import { PrismaService } from "src/modules/prisma/application/prisma.service";
import { ClerkIdVo } from "src/modules/users/domain/clerk-id.vo";
import { SaveUserVo } from "src/modules/users/domain/save-user.vo";
import { AvatarUrlVo } from "src/modules/users/domain/user-avatar-url.vo";
import { IdVo } from "src/modules/users/domain/user-id.vo";
import { NameVo } from "src/modules/users/domain/user-name.vo";
import { User } from "src/modules/users/domain/user.entity";
import { IUserRepository } from "src/modules/users/domain/user.repository.interface";

@Injectable()
export class UsersRepository implements IUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * 新しいユーザーを作成します。
   * @param {SaveUserVo} user - 保存するユーザーデータ
   * @returns {User} 作成されたUserエンティティ
   */
  async create(user: SaveUserVo): Promise<User> {
    return await this.prismaService.user
      .create({
        data: {
          clerkId: user.getClerkId().getValue(),
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

  /**
   * 既存のユーザーを更新します。
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
