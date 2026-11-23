import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derive = promisify(scrypt);
export const sessionSeconds = 8 * 60 * 60;
export const sessionCookie = "wolffs_session";

export async function passwordMatches(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(hash ?? "") ||
      Buffer.byteLength(password) > 1024) return false;
  const calculated = await derive(password, salt, 64) as Buffer;
  return timingSafeEqual(calculated, Buffer.from(hash, "hex"));
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function issueSession(secret: string, now = Date.now()) {
  const payload = `${now + sessionSeconds * 1000}.${randomBytes(16).toString("hex")}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function validSession(token: string, secret: string, now = Date.now()) {
  if (!/^[0-9]{1,16}\.[a-f0-9]{32}\.[a-f0-9]{64}$/.test(token)) return false;
  const [expiry, nonce, signature] = token.split(".");
  return Number(expiry) > now && timingSafeEqual(
    Buffer.from(signature, "hex"), Buffer.from(sign(`${expiry}.${nonce}`, secret), "hex"),
  );
}
