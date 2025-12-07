import { ClerkIdVo } from "src/modules/users/domain/clerk-id.vo";
import { AvatarUrlVo } from "src/modules/users/domain/user-avatar-url.vo";
import { IdVo } from "src/modules/users/domain/user-id.vo";
import { NameVo } from "src/modules/users/domain/user-name.vo";
import { User } from "src/modules/users/domain/user.entity";

import { UserMapper } from "./user.mapper";

describe("UserMapper", () => {
  describe("formatResponse", () => {
    it("should format user response correctly", () => {
      const user = User.reconstruct(
        IdVo.of("550e8400-e29b-41d4-a716-446655440000"),
        ClerkIdVo.of("user_123"),
        NameVo.of("testuser"),
        AvatarUrlVo.of("http://example.com/avatar.png")
      );

      const result = UserMapper.formatResponse(user);

      expect(result).toEqual({
        id: "550e8400-e29b-41d4-a716-446655440000",
        clerkId: "user_123",
        name: "testuser",
        avatarUrl: "http://example.com/avatar.png",
      });
    });

    it("should throw error if user is null", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      expect(() => UserMapper.formatResponse(null as any)).toThrow();
    });
  });
});
