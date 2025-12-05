/**
 * ユーザーID用のValue Object
 */
export class IdVo {
  private constructor(private readonly value: string) {}

  static of(value: string): IdVo {
    this.validate(value);

    return new IdVo(value);
  }

  private static validate(value: string): void {
    if (typeof value !== "string") {
      throw new Error("User ID must be a string");
    }

    if (value.trim().length === 0) {
      throw new Error("User ID cannot be empty");
    }

    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidV4Regex.test(value)) {
      throw new Error("Invalid UUID v4 format");
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: IdVo): boolean {
    return this.value === other.value;
  }
}
