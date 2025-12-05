import { BadRequestException, RawBodyRequest } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { VerifySvixSignatureUsecase } from "src/modules/svix/application/verify-svix-signature.usecase";
import { SaveUsersUsecase } from "src/modules/users/application/save-users.usecase";
import { ClerkIdVo } from "src/modules/users/domain/clerk-id.vo";
import { AvatarUrlVo } from "src/modules/users/domain/user-avatar-url.vo";
import { IdVo } from "src/modules/users/domain/user-id.vo";
import { NameVo } from "src/modules/users/domain/user-name.vo";
import { User } from "src/modules/users/domain/user.entity";

import { SaveUserDto } from "./dto/save-user.dto";
import { WebhookUsersController } from "./webhook-users.controller";

describe("WebhookUsersController", () => {
  let controller: WebhookUsersController;
  let saveUsersUsecase: SaveUsersUsecase;
  let verifySvixSignatureUsecase: VerifySvixSignatureUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookUsersController],
      providers: [
        {
          provide: SaveUsersUsecase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: VerifySvixSignatureUsecase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WebhookUsersController>(WebhookUsersController);
    saveUsersUsecase = module.get<SaveUsersUsecase>(SaveUsersUsecase);
    verifySvixSignatureUsecase = module.get<VerifySvixSignatureUsecase>(VerifySvixSignatureUsecase);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("save", () => {
    const svixId = "test-svix-id";
    const timestamp = "test-timestamp";
    const signature = "test-signature";
    const saveUserDto: SaveUserDto = {
      type: "user.created",
      data: {
        id: "user_123",
        username: "testuser",
        image_url: "http://example.com/avatar.png",
      },
    };
    const req = { rawBody: Buffer.from("test-body") } as RawBodyRequest<Request>;

    it("should verify signature and save user", async () => {
      const expectedUser = User.reconstruct(
        IdVo.of("550e8400-e29b-41d4-a716-446655440000"),
        ClerkIdVo.of("user_123"),
        NameVo.of("testuser"),
        AvatarUrlVo.of("http://example.com/avatar.png")
      );

      const verifySvixSignatureSpy = jest.spyOn(verifySvixSignatureUsecase, "execute");
      const saveUsersSpy = jest.spyOn(saveUsersUsecase, "execute").mockResolvedValue(expectedUser);

      const result = await controller.save(svixId, timestamp, signature, saveUserDto, req);

      expect(verifySvixSignatureSpy).toHaveBeenCalledWith(req, svixId, timestamp, signature);
      expect(saveUsersSpy).toHaveBeenCalledWith(saveUserDto);
      expect(result).toEqual({
        id: "550e8400-e29b-41d4-a716-446655440000",
        clerkId: "user_123",
        name: "testuser",
        avatarUrl: "http://example.com/avatar.png",
      });
    });

    it("should throw BadRequestException if svix headers are missing", async () => {
      await expect(
        controller.save(undefined as unknown as string, timestamp, signature, saveUserDto, req)
      ).rejects.toThrow(BadRequestException);

      await expect(
        controller.save(svixId, undefined as unknown as string, signature, saveUserDto, req)
      ).rejects.toThrow(BadRequestException);

      await expect(
        controller.save(svixId, timestamp, undefined as unknown as string, saveUserDto, req)
      ).rejects.toThrow(BadRequestException);
    });
  });
});
