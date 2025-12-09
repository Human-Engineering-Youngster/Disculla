import { Injectable, Logger, RawBodyRequest, UnauthorizedException } from "@nestjs/common";

import { VerifySvix } from "src/modules/svix/infrastructure/verify-svix";
import { WebhookRequiredHeaders, WebhookVerificationError } from "svix";

@Injectable()
export class VerifySvixSignatureUseCase {
  private readonly logger = new Logger(VerifySvixSignatureUseCase.name);

  constructor(private readonly verifySvix: VerifySvix) {}

  /**
   * Clerk署名を検証する
   * @param {RawBodyRequest<Request>} req - raw bodyリクエスト
   * @param {string} svixId - Svix IDヘッダー
   * @param {string} timestamp - タイムスタンプヘッダー
   * @param {string} signature - 署名ヘッダー
   * @throws {UnauthorizedException} 署名が無効な場合にスローされる例外
   * @throws {WebhookVerificationError} 署名が無効な場合にスローされる例外
   */
  execute(
    req: RawBodyRequest<Request>,
    svixId: string,
    timestamp: string,
    signature: string
  ): void {
    const svixHeaders: WebhookRequiredHeaders = {
      "svix-id": svixId,
      "svix-timestamp": timestamp,
      "svix-signature": signature,
    };

    const rawBody = req.rawBody?.toString("utf8");

    if (!rawBody) {
      const errorMessage = "Missing raw body for webhook verification";
      this.logger.error(errorMessage);
      throw new UnauthorizedException(errorMessage);
    }

    try {
      this.verifySvix.verifySignature(rawBody, svixHeaders);
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        this.logger.error(error);
        throw error;
      }

      const errorMessage = "Error verifying webhook signature";
      this.logger.error(errorMessage);
      throw new UnauthorizedException(errorMessage);
    }

    this.logger.log("Webhook signature verified successfully");
  }
}
