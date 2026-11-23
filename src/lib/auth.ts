import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionCookie, validSession } from "./session";

export async function isSignedIn() {
  const secret = process.env.NINA_SESSION_SECRET ?? "";
  const token = (await cookies()).get(sessionCookie)?.value;
  return secret.length >= 32 && !!token && validSession(token, secret);
}

export async function requireNina() {
  if (!(await isSignedIn())) redirect("/anmelden");
}
