import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { ClerkIdVo } from "src/modules/users/domain/clerk-id.vo";
import { AvatarUrlVo } from "src/modules/users/domain/user-avatar-url.vo";
import { IdVo } from "src/modules/users/domain/user-id.vo";
import { NameVo } from "src/modules/users/domain/user-name.vo";
import { User } from "src/modules/users/domain/user.entity";
import {
  IUserRepository,
  USER_REPOSITORY,
} from "src/modules/users/domain/user.repository.interface";
import {
  SaveUserDto,
  SaveUserEventTypes,
  saveUserEventTypes,
} from "src/modules/users/interface/dto/save-user.dto";

import { SaveUsersUseCase } from "./save-users.usecase";

describe("SaveUsersUseCase", () => {
  let useCase: SaveUsersUseCase;
  let userRepositoryMock: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    userRepositoryMock = {
      create: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaveUsersUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: userRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<SaveUsersUseCase>(SaveUsersUseCase);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  describe("execute", () => {
    const validData = {
      id: "user_123",
      username: "testuser",
      image_url: "http://example.com/avatar.png",
    };

    const expectedUser = User.reconstruct(
      IdVo.of("550e8400-e29b-41d4-a716-446655440000"),
      ClerkIdVo.of("user_123"),
      NameVo.of("testuser"),
      AvatarUrlVo.of("http://example.com/avatar.png")
    );

    it("should create user when type is CREATE", async () => {
      userRepositoryMock.create.mockResolvedValue(expectedUser);

      const dto: SaveUserDto = {
        type: saveUserEventTypes.CREATE,
        data: validData,
      };

      const createSpy = jest.spyOn(userRepositoryMock, "create");
      const result = await useCase.execute(dto);

      expect(createSpy).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual(expectedUser);
    });

    it("should update user when type is UPDATE", async () => {
      userRepositoryMock.update.mockResolvedValue(expectedUser);

      const dto: SaveUserDto = {
        type: saveUserEventTypes.UPDATE,
        data: validData,
      };

      const updateSpy = jest.spyOn(userRepositoryMock, "update");
      const result = await useCase.execute(dto);

      expect(updateSpy).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual(expectedUser);
    });

    it("should throw BadRequestException for unsupported type", async () => {
      const dto: SaveUserDto = {
        type: "unsupported.type" as unknown as SaveUserEventTypes,
        data: validData,
      };

      await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    });
  });
});
