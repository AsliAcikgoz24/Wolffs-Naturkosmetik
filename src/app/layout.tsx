import type { Metadata } from "next";
import Link from "next/link";
import { Leaf, LogOut } from "lucide-react";
import "@fontsource-variable/manrope";
import "@fontsource-variable/fraunces";
import "./globals.css";
import { isSignedIn } from "../lib/auth";
import { signOut } from "./anmelden/actions";

export const metadata: Metadata = {
  title: "Wolff’s Naturkosmetik",
  description: "Produktverwaltung für Wolff’s Naturkosmetik",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const signedIn = await isSignedIn();
  return (
    <html lang="de">
      <body>
        <header className="border-b border-[var(--line)] bg-[var(--paper)]">
          <div className="shell flex min-h-20 flex-wrap items-center justify-between gap-4 py-3">
            <Link href="/" className="brand"><span className="brand-mark"><Leaf size={22} aria-hidden="true" /></span>
              Wolff’s <span>Naturkosmetik</span>
            </Link>
            {signedIn && <nav aria-label="Hauptnavigation" className="flex items-center gap-3">
              <Link className="nav-current" href="/produkte">Produkte</Link>
              <form action={signOut}><button className="quiet"><LogOut size={17} aria-hidden="true" /> Abmelden</button></form>
            </nav>}
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
