import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Headers,
  RawBodyRequest,
  Req,
  Logger,
} from "@nestjs/common";

import { VerifySvixSignatureUsecase } from "src/modules/svix/application/verify-svix-signature.usecase";
import { SaveUsersUsecase } from "src/modules/users/application/save-users.usecase";
import { SaveUserDto } from "src/modules/users/interface/dto/save-user.dto";
import { UserMapper, UsersResponse } from "src/modules/users/interface/mapper/user.mapper";

@Controller("webhooks/clerk/users")
export class WebhookUsersController {
  private readonly logger = new Logger(WebhookUsersController.name);

  constructor(
    private readonly saveUsersUsecase: SaveUsersUsecase,
    private readonly verifySvixSignatureUsecase: VerifySvixSignatureUsecase
  ) {}

  @Post()
  async save(
    @Headers("svix-id") svixId: string,
    @Headers("svix-timestamp") timestamp: string,
    @Headers("svix-signature") signature: string,
    @Body() saveUserDto: SaveUserDto,
    @Req() req: RawBodyRequest<Request>
  ): Promise<UsersResponse> {
    if (!svixId || !timestamp || !signature) {
      const errorMessage = "Missing Svix headers for webhook verification";
      this.logger.error(errorMessage);
      throw new BadRequestException(errorMessage);
    }

    this.verifySvixSignatureUsecase.execute(req, svixId, timestamp, signature);
    const user = await this.saveUsersUsecase.execute(saveUserDto);
    this.logger.log("User saved successfully");
    return UserMapper.formatResponse(user);
  }
}
