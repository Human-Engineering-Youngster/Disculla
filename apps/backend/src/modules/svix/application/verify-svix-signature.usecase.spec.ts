import { RawBodyRequest, UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { VerifySvix } from "src/modules/svix/infrastructure/verify-svix";
import { WebhookVerificationError } from "svix";

import { VerifySvixSignatureUsecase } from "./verify-svix-signature.usecase";

describe("VerifySvixSignatureUsecase", () => {
  let usecase: VerifySvixSignatureUsecase;
  let verifySvix: VerifySvix;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifySvixSignatureUsecase,
        {
          provide: VerifySvix,
          useValue: {
            verifySignature: jest.fn(),
          },
        },
      ],
    }).compile();

    usecase = module.get<VerifySvixSignatureUsecase>(VerifySvixSignatureUsecase);
    verifySvix = module.get<VerifySvix>(VerifySvix);
  });

  it("should be defined", () => {
    expect(usecase).toBeDefined();
  });

  describe("execute", () => {
    const svixId = "test-svix-id";
    const timestamp = "test-timestamp";
    const signature = "test-signature";
    const rawBodyContent = "test-body";
    const req = { rawBody: Buffer.from(rawBodyContent) } as RawBodyRequest<Request>;

    it("should verify signature successfully", () => {
      const verifySignatureSpy = jest.spyOn(verifySvix, "verifySignature");
      verifySignatureSpy.mockClear();
      usecase.execute(req, svixId, timestamp, signature);

      expect(verifySignatureSpy).toHaveBeenCalledWith(rawBodyContent, {
        "svix-id": svixId,
        "svix-timestamp": timestamp,
        "svix-signature": signature,
      });
    });

    it("should throw UnauthorizedException if rawBody is missing", () => {
      const reqWithoutBody = {} as RawBodyRequest<Request>;

      expect(() => usecase.execute(reqWithoutBody, svixId, timestamp, signature)).toThrow(
        UnauthorizedException
      );
    });

    it("should throw WebhookVerificationError if verification fails with WebhookVerificationError", () => {
      const error = new WebhookVerificationError("Invalid signature");
      jest.spyOn(verifySvix, "verifySignature").mockImplementation(() => {
        throw error;
      });

      expect(() => usecase.execute(req, svixId, timestamp, signature)).toThrow(
        WebhookVerificationError
      );
    });

    it("should throw UnauthorizedException if verification fails with other errors", () => {
      jest.spyOn(verifySvix, "verifySignature").mockImplementation(() => {
        throw new Error("Some other error");
      });

      expect(() => usecase.execute(req, svixId, timestamp, signature)).toThrow(
        UnauthorizedException
      );
    });
  });
});
