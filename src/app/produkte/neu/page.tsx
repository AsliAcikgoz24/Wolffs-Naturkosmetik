import Link from "next/link";
import { db } from "../../../lib/db";
import { requireNina } from "../../../lib/auth";
import { ProductForm } from "../produktformular";

export default async function NewProductPage() {
  await requireNina();
  const ingredients = await db.ingredient.findMany({ orderBy: { name: "asc" } });
  return (
    <main className="shell main-space max-w-[860px]">
      <Link className="quiet mb-5" href="/produkte">Zur Produktübersicht</Link>
      <h1 className="title mb-3">Produkt erfassen</h1>
      <p className="muted mb-8">Erfasse die Produktdaten und ordne die enthaltenen Inhaltsstoffe zu.</p>
      <ProductForm ingredients={ingredients} />
    </main>
  );
}
