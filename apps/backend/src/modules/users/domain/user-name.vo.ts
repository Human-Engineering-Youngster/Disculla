/**
 * ユーザー名用のValue Object
 */
export class NameVo {
  private constructor(private readonly value: string) {}

  static of(value: string): NameVo {
    this.validate(value);

    return new NameVo(value);
  }

  private static validate(value: string): void {
    if (typeof value !== "string") {
      throw new Error("Name must be a string");
    }

    if (value.trim().length === 0) {
      throw new Error("Name cannot be empty");
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: NameVo): boolean {
    return this.value === other.value;
  }
}
