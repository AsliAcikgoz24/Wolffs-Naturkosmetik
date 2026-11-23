"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(signIn, "");
  return (
    <form action={action} className="space-y-5">
      <label className="field" htmlFor="password">Passwort <span aria-hidden="true">*</span></label>
      <input className="input" id="password" name="password" type="password"
        autoComplete="current-password" required aria-invalid={!!error} aria-describedby={error ? "login-error" : undefined} />
      {error && <p id="login-error" role="alert" className="error">{error}</p>}
      <button className="primary w-full" disabled={pending}>{pending ? "Anmeldung läuft …" : "Anmelden"}</button>
    </form>
  );
}
