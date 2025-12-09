import { Module } from "@nestjs/common";

import { PrismaModule } from "src/modules/prisma/prisma.module";
import { UserModule } from "src/modules/user.module";

@Module({
  imports: [PrismaModule, UserModule],
  providers: [],
})
export class AppModule {}
