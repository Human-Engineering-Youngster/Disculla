import { Server } from "http";

import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { AppModule } from "src/modules/app.module";
import { PrismaService } from "src/modules/prisma/application/prisma.service";
import { VerifySvix } from "src/modules/svix/infrastructure/verify-svix";
import * as request from "supertest";

describe("WebhookUsersController (e2e)", () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let verifySvix: VerifySvix;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(VerifySvix)
      .useValue({
        verifySignature: jest.fn(),
      })
      .overrideProvider(PrismaService)
      .useValue({
        user: {
          create: jest.fn(),
          update: jest.fn(),
        },
      })
      .compile();

    app = moduleFixture.createNestApplication({
      rawBody: true,
    });
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    verifySvix = moduleFixture.get<VerifySvix>(VerifySvix);
  });

  afterEach(async () => {
    await app.close();
  });

  it("/webhooks/clerk/users (POST) - success (create)", async () => {
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

    const prismaUser = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      clerkId: "user_123",
      name: "testuser",
      avatarUrl: "http://example.com/avatar.png",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const verifySpy = jest.spyOn(verifySvix, "verifySignature");
    const createSpy = jest.spyOn(prismaService.user, "create").mockResolvedValue(prismaUser);

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
        expect(createSpy).toHaveBeenCalledWith({
          data: {
            clerkId: "user_123",
            name: "testuser",
            avatarUrl: "http://example.com/avatar.png",
          },
        });
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
