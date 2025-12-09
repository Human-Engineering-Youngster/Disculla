import { ClerkIdVo } from "./clerk-id.vo";
import { SaveUserVo } from "./save-user.vo";
import { AvatarUrlVo } from "./user-avatar-url.vo";
import { NameVo } from "./user-name.vo";

describe("SaveUserVo", () => {
  it("should create a valid SaveUserVo", () => {
    const clerkId = ClerkIdVo.of("user_123");
    const name = NameVo.of("testuser");
    const avatarUrl = AvatarUrlVo.of("http://example.com/avatar.png");

    const vo = SaveUserVo.create(clerkId, name, avatarUrl);

    expect(vo.getClerkId()).toBe(clerkId);
    expect(vo.getName()).toBe(name);
    expect(vo.getAvatarUrl()).toBe(avatarUrl);
  });
});
