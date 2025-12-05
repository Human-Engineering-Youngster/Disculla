/**
 * Clerk ID用のValue Object
 */
export class ClerkIdVo {
  private constructor(private readonly value: string) {}

  static of(value: string): ClerkIdVo {
    this.validate(value);

    return new ClerkIdVo(value);
  }

  private static validate(value: string): void {
    if (typeof value !== "string") {
      throw new Error("Clerk ID must be a string");
    }

    if (value.trim().length === 0) {
      throw new Error("Clerk ID cannot be empty");
    }

    if (!value.startsWith("user")) {
      throw new Error("Invalid Clerk ID");
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ClerkIdVo): boolean {
    return this.value === other.value;
  }
}
