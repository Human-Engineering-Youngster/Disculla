import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { Webhook } from "svix";

export interface SvixHeaders {
  "svix-id": string;
  "svix-timestamp": string;
  "svix-signature": string;
}

@Injectable()
export class VerifySvix {
  private readonly webhook: Webhook;
  private readonly logger = new Logger(VerifySvix.name);

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>("SIGNING_SECRET");

    if (!secret) {
      const errorMessage = "Missing SIGNING_SECRET in configuration";
      this.logger.error(errorMessage);
      throw new InternalServerErrorException(errorMessage);
    }

    this.webhook = new Webhook(secret);
  }

  /**
   * Svix署名を検証する
   * @param {string} body - raw body リクエスト
   * @param {SvixHeaders} svixHeaders - Svixヘッダー
   * @throws {WebhookVerificationError} 署名が無効な場合にスローされる例外
   */
  verifySignature(body: string, svixHeaders: SvixHeaders): void {
    this.webhook.verify(body, svixHeaders);
  }
}
