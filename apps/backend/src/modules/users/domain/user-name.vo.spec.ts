import { NameVo } from "./user-name.vo";

describe("NameVo", () => {
  it("should create a valid NameVo", () => {
    const name = "testuser";
    const vo = NameVo.of(name);
    expect(vo.getValue()).toBe(name);
  });

  it("should throw error if value is not a string", () => {
    expect(() => NameVo.of(123 as unknown as string)).toThrow("Name must be a string");
  });

  it("should throw error if value is empty", () => {
    expect(() => NameVo.of("")).toThrow("Name cannot be empty");
    expect(() => NameVo.of("   ")).toThrow("Name cannot be empty");
  });

  it("should check equality", () => {
    const vo1 = NameVo.of("testuser");
    const vo2 = NameVo.of("testuser");
    const vo3 = NameVo.of("otheruser");

    expect(vo1.equals(vo2)).toBe(true);
    expect(vo1.equals(vo3)).toBe(false);
  });
});
