import { redirect } from "next/navigation";
import { isSignedIn } from "../../lib/auth";
import { LoginForm } from "./form";

export default async function LoginPage() {
  if (await isSignedIn()) redirect("/produkte");
  return (
    <main className="mx-auto w-full max-w-[480px] px-5 py-20">
      <section className="panel p-8 sm:p-11">
        <h1 className="title mb-3">Anmelden</h1>
        <p className="muted mb-8">Melde dich an, um deine Produkte zu verwalten.</p>
        <LoginForm />
      </section>
    </main>
  );
}
