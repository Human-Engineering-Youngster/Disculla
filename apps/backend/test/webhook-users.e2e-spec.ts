import { Server } from "http";

import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { AppModule } from "src/modules/app.module";
import { VerifySvix } from "src/modules/svix/infrastructure/verify-svix";
import { SaveUsersUsecase } from "src/modules/users/application/save-users.usecase";
import { ClerkIdVo } from "src/modules/users/domain/clerk-id.vo";
import { AvatarUrlVo } from "src/modules/users/domain/user-avatar-url.vo";
import { IdVo } from "src/modules/users/domain/user-id.vo";
import { NameVo } from "src/modules/users/domain/user-name.vo";
import { User } from "src/modules/users/domain/user.entity";
import * as request from "supertest";

describe("WebhookUsersController (e2e)", () => {
  let app: INestApplication;
  let saveUsersUsecase: SaveUsersUsecase;
  let verifySvix: VerifySvix;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(VerifySvix)
      .useValue({
        verifySignature: jest.fn(),
      })
      .overrideProvider(SaveUsersUsecase)
      .useValue({
        execute: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication({
      rawBody: true,
    });
    await app.init();

    saveUsersUsecase = moduleFixture.get<SaveUsersUsecase>(SaveUsersUsecase);
    verifySvix = moduleFixture.get<VerifySvix>(VerifySvix);
  });

  afterEach(async () => {
    await app.close();
  });

  it("/webhooks/clerk/users (POST) - success", async () => {
    const svixId = "test-svix-id";
    const timestamp = "test-timestamp";
    const signature = "test-signature";
    const body = {
      type: "user.created",
      data: {
        id: "user_123",
        username: "testuser",
        image_url: "http://example.com/avatar.png",
      },
    };

    const expectedUser = User.reconstruct(
      IdVo.of("123e4567-e89b-12d3-a456-426614174000"),
      ClerkIdVo.of("user_123"),
      NameVo.of("testuser"),
      AvatarUrlVo.of("http://example.com/avatar.png")
    );

    const verifySpy = jest.spyOn(verifySvix, "verifySignature");
    const saveUsersSpy = jest.spyOn(saveUsersUsecase, "execute").mockResolvedValue(expectedUser);

    return request(app.getHttpServer() as Server)
      .post("/webhooks/clerk/users")
      .set("svix-id", svixId)
      .set("svix-timestamp", timestamp)
      .set("svix-signature", signature)
      .send(body)
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({
          id: "123e4567-e89b-12d3-a456-426614174000",
          clerkId: "user_123",
          name: "testuser",
          avatarUrl: "http://example.com/avatar.png",
        });

        expect(verifySpy).toHaveBeenCalled();
        expect(saveUsersSpy).toHaveBeenCalled();
      });
  });

  it("/webhooks/clerk/users (POST) - missing headers", async () => {
    return request(app.getHttpServer() as Server)
      .post("/webhooks/clerk/users")
      .send({})
      .expect(400);
  });

  it("/webhooks/clerk/users (POST) - invalid signature", async () => {
    const verifySpy = jest.spyOn(verifySvix, "verifySignature").mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    return request(app.getHttpServer() as Server)
      .post("/webhooks/clerk/users")
      .set("svix-id", "id")
      .set("svix-timestamp", "ts")
      .set("svix-signature", "sig")
      .send({})
      .expect(401)
      .expect(() => {
        expect(verifySpy).toHaveBeenCalled();
      });
  });
});
