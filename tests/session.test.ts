import assert from "node:assert/strict";
import { randomBytes, scryptSync } from "node:crypto";
import test from "node:test";
import { issueSession, passwordMatches, sessionSeconds, validSession } from "../src/lib/session";

test("Anmeldung prüft den gesalzenen Passwort-Hash", async () => {
  const password = randomBytes(24).toString("hex");
  const salt = randomBytes(16).toString("hex");
  const hash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
  assert.equal(await passwordMatches(password, hash), true);
  assert.equal(await passwordMatches(randomBytes(24).toString("hex"), hash), false);
  assert.equal(await passwordMatches(password, "ungültig"), false);
});

test("Sitzungen mit ungültiger Signatur oder abgelaufener Gültigkeit werden abgewiesen", () => {
  const secret = randomBytes(32).toString("hex");
  const now = Date.now();
  const token = issueSession(secret, now);
  assert.equal(validSession(token, secret, now), true);
  assert.equal(validSession(token, "anderer Schlüssel", now), false);
  assert.equal(validSession(token, secret, now + sessionSeconds * 1000), false);
});
