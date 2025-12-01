import { Module } from "@nestjs/common";

import { PrismaModule } from "src/modules/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
