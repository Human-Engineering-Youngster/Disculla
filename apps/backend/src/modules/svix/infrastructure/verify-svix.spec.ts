import { InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";

import { Webhook } from "svix";

import { VerifySvix } from "./verify-svix";

jest.mock("svix");

describe("VerifySvix", () => {
  let verifySvix: VerifySvix;
  let webhookMock: jest.Mocked<Webhook>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifySvix,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue("test-secret"),
          },
        },
      ],
    }).compile();

    verifySvix = module.get<VerifySvix>(VerifySvix);

    webhookMock = (Webhook as unknown as jest.Mock).mock.instances[0] as jest.Mocked<Webhook>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(verifySvix).toBeDefined();
  });

  describe("constructor", () => {
    it("should throw InternalServerErrorException if SIGNING_SECRET is missing", async () => {
      await expect(
        Test.createTestingModule({
          providers: [
            VerifySvix,
            {
              provide: ConfigService,
              useValue: {
                get: jest.fn().mockReturnValue(undefined),
              },
            },
          ],
        }).compile()
      ).rejects.toThrow(InternalServerErrorException);
    });

    it("should create Webhook instance if SIGNING_SECRET is present", () => {
      expect(Webhook).toHaveBeenCalledWith("test-secret");
    });
  });

  describe("verifySignature", () => {
    it("should call webhook.verify with correct arguments", () => {
      const body = "test-body";
      const headers = {
        "svix-id": "id",
        "svix-timestamp": "timestamp",
        "svix-signature": "signature",
      };

      const verifySpy = jest.spyOn(webhookMock, "verify");
      verifySvix.verifySignature(body, headers);

      expect(verifySpy).toHaveBeenCalledWith(body, headers);
    });
  });
});
