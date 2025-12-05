/**
 * ユーザーのアバターURL用のValue Object
 */
export class AvatarUrlVo {
  private constructor(private readonly value: string) {}

  static of(value: string): AvatarUrlVo {
    this.validate(value);

    return new AvatarUrlVo(value);
  }

  private static validate(value: string): void {
    if (typeof value !== "string") {
      throw new Error("Avatar URL must be a string");
    }

    if (value.trim().length === 0) {
      throw new Error("Avatar URL cannot be empty");
    }

    try {
      new URL(value);
    } catch {
      throw new Error("Invalid URL format");
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: AvatarUrlVo): boolean {
    return this.value === other.value;
  }
}
