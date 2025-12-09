import { ClerkIdVo } from "./clerk-id.vo";
import { AvatarUrlVo } from "./user-avatar-url.vo";
import { IdVo } from "./user-id.vo";
import { NameVo } from "./user-name.vo";
import { User } from "./user.entity";

describe("User", () => {
  it("should reconstruct a valid User entity", () => {
    const id = IdVo.of("550e8400-e29b-41d4-a716-446655440000");
    const clerkId = ClerkIdVo.of("user_123");
    const name = NameVo.of("testuser");
    const avatarUrl = AvatarUrlVo.of("http://example.com/avatar.png");

    const user = User.reconstruct(id, clerkId, name, avatarUrl);

    expect(user.getAvatarUrl()).toBe(avatarUrl);
  });
});
