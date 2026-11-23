import { randomBytes, scryptSync } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

if (process.stdin.isTTY) {
  process.stderr.write("Passwort verdeckt eingeben, dann Enter drücken: ");
  process.stdin.setRawMode(true);
}
let password = "";
for await (const chunk of process.stdin.setEncoding("utf8")) {
  for (const char of chunk) {
    if (char === "\u0003") {
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
      process.exit(130);
    }
    if (char === "\n" || char === "\r") break;
    if (char === "\u007f" || char === "\b") password = password.slice(0, -1);
    else password += char;
  }
  if (/[\r\n]/.test(chunk)) break;
}
if (process.stdin.isTTY) {
  process.stdin.setRawMode(false);
  process.stderr.write("\n");
}
if (password.length < 12 || Buffer.byteLength(password) > 1024) {
  console.error("Bitte ein Passwort mit mindestens 12 Zeichen und höchstens 1024 Bytes wählen.");
  process.exit(1);
}
const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");
let existing = "";
try {
  existing = readFileSync(".env.local", "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const vars = existing.split(/\r?\n/).filter(line => !/^\s*(?:export\s+)?NINA_(?:PASSWORD_HASH|SESSION_SECRET)\s*=/.test(line));
writeFileSync(".env.local", [
  ...vars, `NINA_PASSWORD_HASH=${salt}:${hash}`,
  `NINA_SESSION_SECRET=${randomBytes(32).toString("hex")}`, "",
].join("\n"), { mode: 0o600 });
console.log("Anmeldung in .env.local eingerichtet.");
