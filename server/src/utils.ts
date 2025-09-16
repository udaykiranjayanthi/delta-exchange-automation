import crypto from "crypto";

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
