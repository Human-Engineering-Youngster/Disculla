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

@Injectable()
export class SaveUsersUsecase {
  private readonly logger = new Logger(SaveUsersUsecase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * ユーザー情報を保存します。
   * typeによって新規作成または更新を行います。
   * サポートされていないtypeの場合、BadRequestExceptionをスローします。
   * @param {SaveUserDto} props - 保存するユーザーデータとイベントタイプ
   * @param {string} props.type - イベントタイプ
   * @param {object} props.data - ユーザーデータ
   * @returns 保存されたUserエンティティ
   * @throws BadRequestException - サポートされていないtypeの場合にスローされます。
   */
  async execute({ type, data }: SaveUserDto): Promise<User> {
    const user = SaveUserVo.create(
      ClerkIdVo.of(data.id),
      NameVo.of(data.username),
      AvatarUrlVo.of(data.image_url)
    );

    if (type === saveUserEventTypes.CREATE) {
      const createdUser = await this.userRepository.create(user);
      this.logger.log("User created successfully");

      return createdUser;
    } else if (type === saveUserEventTypes.UPDATE) {
      const updatedUser = await this.userRepository.update(user);
      this.logger.log("User updated successfully");

      return updatedUser;
    }

    const errorMessage = "Unsupported event type";
    this.logger.error(errorMessage);
    throw new BadRequestException(errorMessage);
  }
}
