import { ClerkIdVo } from "./clerk-id.vo";

describe("ClerkIdVo", () => {
  it("should create a valid ClerkIdVo", () => {
    const id = "user_123";
    const vo = ClerkIdVo.of(id);
    expect(vo.getValue()).toBe(id);
  });

  it("should throw error if value is not a string", () => {
    expect(() => ClerkIdVo.of(123 as unknown as string)).toThrow("Clerk ID must be a string");
  });

  it("should throw error if value is empty", () => {
    expect(() => ClerkIdVo.of("")).toThrow("Clerk ID cannot be empty");
    expect(() => ClerkIdVo.of("   ")).toThrow("Clerk ID cannot be empty");
  });

  it("should throw error if value does not start with 'user'", () => {
    expect(() => ClerkIdVo.of("invalid_id")).toThrow("Invalid Clerk ID");
  });

  it("should check equality", () => {
    const vo1 = ClerkIdVo.of("user_123");
    const vo2 = ClerkIdVo.of("user_123");
    const vo3 = ClerkIdVo.of("user_456");

    expect(vo1.equals(vo2)).toBe(true);
    expect(vo1.equals(vo3)).toBe(false);
  });
});
