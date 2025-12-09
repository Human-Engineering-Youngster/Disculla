import { InternalServerErrorException, Logger } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { PrismaService } from "src/modules/prisma/application/prisma.service";
import { ClerkIdVo } from "src/modules/users/domain/clerk-id.vo";
import { SaveUserVo } from "src/modules/users/domain/save-user.vo";
import { AvatarUrlVo } from "src/modules/users/domain/user-avatar-url.vo";
import { NameVo } from "src/modules/users/domain/user-name.vo";
import { PrismaUser } from "src/modules/users/infrastructure/prisma-user.type";

import { UsersRepository } from "./users.repository";

type MockPrismaService = {
  user: {
    create: jest.Mock;
    update: jest.Mock;
  };
};

describe("UsersRepository", () => {
  let repository: UsersRepository;
  let prismaServiceMock: MockPrismaService;

  beforeEach(async () => {
    prismaServiceMock = {
      user: {
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  describe("create", () => {
    it("should create a user", async () => {
      const saveUserVo = SaveUserVo.create(
        ClerkIdVo.of("user_123"),
        NameVo.of("testuser"),
        AvatarUrlVo.of("http://example.com/avatar.png")
      );

      const prismaUser: PrismaUser = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        clerkId: "user_123",
        name: "testuser",
        avatarUrl: "http://example.com/avatar.png",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaServiceMock.user.create.mockResolvedValue(prismaUser);

      const result = await repository.create(saveUserVo);

      expect(prismaServiceMock.user.create).toHaveBeenCalledWith({
        data: {
          clerkId: "user_123",
          name: "testuser",
          avatarUrl: "http://example.com/avatar.png",
        },
      });
      expect(result.getId().getValue()).toBe(prismaUser.id);
      expect(result.getClerkId().getValue()).toBe(prismaUser.clerkId);
    });

    it("should throw InternalServerErrorException if prisma fails", async () => {
      const saveUserVo = SaveUserVo.create(
        ClerkIdVo.of("user_123"),
        NameVo.of("testuser"),
        AvatarUrlVo.of("http://example.com/avatar.png")
      );

      prismaServiceMock.user.create.mockRejectedValue(new Error("Prisma error"));
      try {
        await repository.create(saveUserVo);
        fail("Expected repository.create to throw InternalServerErrorException");
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        expect((err as Error).message).toBe("Failed to create user");
      }
    });
  });

  describe("update", () => {
    it("should update a user", async () => {
      const saveUserVo = SaveUserVo.create(
        ClerkIdVo.of("user_123"),
        NameVo.of("updateduser"),
        AvatarUrlVo.of("http://example.com/new-avatar.png")
      );

      const prismaUser: PrismaUser = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        clerkId: "user_123",
        name: "updateduser",
        avatarUrl: "http://example.com/new-avatar.png",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaServiceMock.user.update.mockResolvedValue(prismaUser);

      const result = await repository.update(saveUserVo);

      expect(prismaServiceMock.user.update).toHaveBeenCalledWith({
        where: {
          clerkId: "user_123",
        },
        data: {
          name: "updateduser",
          avatarUrl: "http://example.com/new-avatar.png",
        },
      });
      expect(result.getName().getValue()).toBe(prismaUser.name);
      expect(result.getAvatarUrl().getValue()).toBe(prismaUser.avatarUrl);
    });

    it("should throw InternalServerErrorException if prisma fails", async () => {
      const saveUserVo = SaveUserVo.create(
        ClerkIdVo.of("user_123"),
        NameVo.of("updateduser"),
        AvatarUrlVo.of("http://example.com/new-avatar.png")
      );

      prismaServiceMock.user.update.mockRejectedValue(new Error("Prisma error"));
      try {
        await repository.update(saveUserVo);
        fail("Expected repository.update to throw InternalServerErrorException");
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        expect((err as Error).message).toBe("Failed to update user");
      }
    });
  });
});
