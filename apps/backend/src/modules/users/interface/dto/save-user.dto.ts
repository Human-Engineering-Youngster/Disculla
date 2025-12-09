import { ApiProperty } from "@nestjs/swagger";

import { Type } from "class-transformer";
import { IsIn, IsNotEmpty, IsString, IsUrl, ValidateNested } from "class-validator";

export const saveUserEventTypes = {
  CREATE: "user.created",
  UPDATE: "user.updated",
} as const;

export type SaveUserEventTypes = (typeof saveUserEventTypes)[keyof typeof saveUserEventTypes];

class UserDataDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: "user_123456789" })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: "john_doe" })
  username: string;

  @IsUrl()
  @IsNotEmpty()
  @ApiProperty({ example: "https://example.com/image.jpg" })
  image_url: string;
}

export class SaveUserDto {
  @IsString()
  @IsIn(Object.values(saveUserEventTypes))
  @ApiProperty({
    default: "user.created",
    enum: Object.values(saveUserEventTypes),
    description: "webhookのeventタイプ",
  })
  type: SaveUserEventTypes;

  @ValidateNested()
  @Type(() => UserDataDto)
  @ApiProperty({
    description: "webhookのeventデータ",
  })
  data: UserDataDto;
}
