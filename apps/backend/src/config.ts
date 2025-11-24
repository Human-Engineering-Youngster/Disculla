export function getServerPort(): number {
  const value = process.env.PORT;

  if (value === undefined) {
    throw new Error("ポート番号の設定がありません。");
  }

  const port = Number(value);
  if (!Number.isInteger(port)) {
    throw new Error("ポート番号は整数で指定してください。");
  }

  if (port < 1 || port > 65535) {
    throw new Error("ポート番号は1から65535の間で指定してください。");
  }

  return port;
}

export function getOrigin(): string[] {
  const origin = process.env.ORIGIN;
  if (origin === undefined) {
    throw new Error("ORIGINの設定がありません。");
  }

  return origin.split(",").map((o) => o.trim());
}
