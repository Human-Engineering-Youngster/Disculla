import { AvatarUrlVo } from "./user-avatar-url.vo";

describe("AvatarUrlVo", () => {
  it("should create a valid AvatarUrlVo", () => {
    const url = "http://example.com/avatar.png";
    const vo = AvatarUrlVo.of(url);
    expect(vo.getValue()).toBe(url);
  });

  it("should throw error if value is not a string", () => {
    expect(() => AvatarUrlVo.of(123 as unknown as string)).toThrow("Avatar URL must be a string");
  });

  it("should throw error if value is empty", () => {
    expect(() => AvatarUrlVo.of("")).toThrow("Avatar URL cannot be empty");
    expect(() => AvatarUrlVo.of("   ")).toThrow("Avatar URL cannot be empty");
  });

  it("should throw error if value is not a valid URL", () => {
    expect(() => AvatarUrlVo.of("invalid-url")).toThrow("Invalid URL format");
  });

  it("should check equality", () => {
    const url1 = "http://example.com/avatar.png";
    const url2 = "http://example.com/avatar.png";
    const url3 = "http://example.com/other.png";
    const vo1 = AvatarUrlVo.of(url1);
    const vo2 = AvatarUrlVo.of(url2);
    const vo3 = AvatarUrlVo.of(url3);

    expect(vo1.equals(vo2)).toBe(true);
    expect(vo1.equals(vo3)).toBe(false);
  });
});
