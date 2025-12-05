import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { VerifySvixSignatureUsecase } from "src/modules/svix/application/verify-svix-signature.usecase";
import { VerifySvix } from "src/modules/svix/infrastructure/verify-svix";

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [VerifySvixSignatureUsecase, VerifySvix],
  exports: [VerifySvixSignatureUsecase],
})
export class SvixModule {}
