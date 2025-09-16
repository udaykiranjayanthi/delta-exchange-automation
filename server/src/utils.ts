import crypto from "crypto";
import { Position, Price } from "./types";

export function createSignature({
  method,
  timestamp,
  requestPath,
  queryParams = "",
  body = "",
  secretKey,
}: {
  method: string;
  timestamp: string;
  requestPath: string;
  queryParams: string;
  body: string;
  secretKey: string;
}): string {
  // Build prehash string
  const prehash = method + timestamp + requestPath + queryParams + body;

  // HMAC SHA256 with secretKey
  return crypto.createHmac("sha256", secretKey).update(prehash).digest("hex");
}

export function createSignatureForWebsocket({
  method = "GET",
  timestamp,
  secretKey,
}: {
  method: string;
  timestamp: string;
  secretKey: string;
}): string {
  // Build prehash string
  const prehash = method + timestamp + "/live";

  // HMAC SHA256 with secretKey
  return crypto.createHmac("sha256", secretKey).update(prehash).digest("hex");
}

export function canSell({
  positions,
  prices,
  upperLimit,
  lowerLimit,
}: {
  positions: Position[];
  prices: Record<string, Price>;
  upperLimit: number;
  lowerLimit: number;
}): boolean {
  let totalPositionValue = 0;
  for (const position of positions) {
    const price = prices[`MARK:${position.product_symbol}`];
    totalPositionValue += position.size * parseFloat(price.price);
  }

  return totalPositionValue <= lowerLimit || totalPositionValue >= upperLimit;
}
