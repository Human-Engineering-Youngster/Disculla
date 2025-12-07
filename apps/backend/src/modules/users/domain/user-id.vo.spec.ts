import { IdVo } from "./user-id.vo";

describe("IdVo", () => {
  it("should create a valid IdVo", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    const vo = IdVo.of(id);
    expect(vo.getValue()).toBe(id);
  });

  it("should throw error if value is not a string", () => {
    expect(() => IdVo.of(123 as unknown as string)).toThrow("User ID must be a string");
  });

  it("should throw error if value is empty", () => {
    expect(() => IdVo.of("")).toThrow("User ID cannot be empty");
    expect(() => IdVo.of("   ")).toThrow("User ID cannot be empty");
  });

  it("should throw error if value is not a valid UUID v4", () => {
    expect(() => IdVo.of("invalid-uuid")).toThrow("Invalid UUID v4 format");
    expect(() => IdVo.of("12345678-1234-1234-1234-1234567890ab-extra")).toThrow(
      "Invalid UUID v4 format"
    );
  });

  it("should check equality", () => {
    const id1 = "550e8400-e29b-41d4-a716-446655440000";
    const id2 = "550e8400-e29b-41d4-a716-446655440001";
    const vo1 = IdVo.of(id1);
    const vo2 = IdVo.of(id1);
    const vo3 = IdVo.of(id2);

    expect(vo1.equals(vo2)).toBe(true);
    expect(vo1.equals(vo3)).toBe(false);
  });
});
