import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { VerifySvixSignatureUseCase } from "src/modules/svix/application/verify-svix-signature.usecase";
import { VerifySvix } from "src/modules/svix/infrastructure/verify-svix";

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [VerifySvixSignatureUseCase, VerifySvix],
  exports: [VerifySvixSignatureUseCase],
})
export class SvixModule {}
