import { Module } from "@nestjs/common";

import { PrismaModule } from "src/modules/prisma/prisma.module";
import { SvixModule } from "src/modules/svix.module";
import { SaveUsersUsecase } from "src/modules/users/application/save-users.usecase";
import { USER_REPOSITORY } from "src/modules/users/domain/user.repository.interface";
import { UsersRepository } from "src/modules/users/infrastructure/users.repository";
import { WebhookUsersController } from "src/modules/users/interface/webhook-users.controller";

@Module({
  imports: [PrismaModule, SvixModule],
  controllers: [WebhookUsersController],
  providers: [SaveUsersUsecase, { provide: USER_REPOSITORY, useClass: UsersRepository }],
})
export class UserModule {}
