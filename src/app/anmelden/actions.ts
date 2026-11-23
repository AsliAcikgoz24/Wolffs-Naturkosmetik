"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { issueSession, passwordMatches, sessionCookie, sessionSeconds } from "../../lib/session";

let failures = 0;
let windowEnds = 0;

export async function signIn(_previous: string, form: FormData) {
  const hash = process.env.NINA_PASSWORD_HASH;
  const secret = process.env.NINA_SESSION_SECRET;
  if (!hash || !secret || secret.length < 32) return "Die Anmeldung muss lokal eingerichtet werden.";
  const now = Date.now();
  if (now >= windowEnds) {
    failures = 0;
    windowEnds = now + 60_000;
  }
  if (failures >= 5) return "Zu viele Anmeldeversuche. Bitte warte kurz und versuche es erneut.";
  failures += 1;
  const password = form.get("password");
  if (typeof password !== "string" || !(await passwordMatches(password, hash))) {
    return "Das Passwort stimmt nicht.";
  }
  failures = 0;
  (await cookies()).set(sessionCookie, issueSession(secret), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionSeconds,
    path: "/",
  });
  redirect("/produkte");
}

export async function signOut() {
  (await cookies()).delete(sessionCookie);
  redirect("/anmelden");
}
