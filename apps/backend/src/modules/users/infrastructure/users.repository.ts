import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";

import { PrismaService } from "src/modules/prisma/application/prisma.service";
import { ClerkIdVo } from "src/modules/users/domain/clerk-id.vo";
import { SaveUserVo } from "src/modules/users/domain/save-user.vo";
import { AvatarUrlVo } from "src/modules/users/domain/user-avatar-url.vo";
import { IdVo } from "src/modules/users/domain/user-id.vo";
import { NameVo } from "src/modules/users/domain/user-name.vo";
import { User } from "src/modules/users/domain/user.entity";
import { IUserRepository } from "src/modules/users/domain/user.repository.interface";
import { PrismaUser } from "src/modules/users/infrastructure/prisma-user.type";

@Injectable()
export class UsersRepository implements IUserRepository {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * PrismaUserをUserエンティティに変換します。
   * @param {PrismaUser} user - Prismaから取得したユーザーデータ
   * @returns {User} 変換されたUserエンティティ
   */
  private toEntity(user: PrismaUser): User {
    return User.reconstruct(
      IdVo.of(user.id),
      ClerkIdVo.of(user.clerkId),
      NameVo.of(user.name),
      AvatarUrlVo.of(user.avatarUrl)
    );
  }

  /**
   * 新しいユーザーを作成します。
   * @param {SaveUserVo} user - 保存するユーザーデータ
   * @returns {User} 作成されたUserエンティティ
   * @throws InternalServerErrorException - 作成中にエラーが発生した場合にスローされます。
   */
  async create(user: SaveUserVo): Promise<User> {
    try {
      const createdUser: PrismaUser = await this.prismaService.user.create({
        data: {
          clerkId: user.getClerkId().getValue(),
          name: user.getName().getValue(),
          avatarUrl: user.getAvatarUrl().getValue(),
        },
      });

      return this.toEntity(createdUser);
    } catch (error) {
      const errorMessage = "Failed to create user";
      this.logger.error(errorMessage, error);

      throw new InternalServerErrorException(errorMessage);
    }
  }

  /**
   * 既存のユーザーを更新します。
   * @param {SaveUserVo} user - 更新するユーザーデータ
   * @returns {User} 更新されたUserエンティティ
   * @throws InternalServerErrorException - 更新中にエラーが発生した場合にスローされます。
   */
  async update(user: SaveUserVo): Promise<User> {
    try {
      const updatedUser = await this.prismaService.user.update({
        where: {
          clerkId: user.getClerkId().getValue(),
        },
        data: {
          name: user.getName().getValue(),
          avatarUrl: user.getAvatarUrl().getValue(),
        },
      });

      return this.toEntity(updatedUser);
    } catch (error) {
      const errorMessage = "Failed to update user";
      this.logger.error(errorMessage, error);

      throw new InternalServerErrorException(errorMessage);
    }
  }
}
