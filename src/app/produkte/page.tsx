import Link from "next/link";
import { Check, Package, Plus } from "lucide-react";
import { requireNina } from "../../lib/auth";
import { db } from "../../lib/db";
import { hasAllergen } from "../../lib/products";

const euros = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export default async function ProductsPage({ searchParams }: {
  searchParams: Promise<{ gespeichert?: string }>;
}) {
  await requireNina();
  const [products, query] = await Promise.all([
    db.product.findMany({ include: { ingredients: true }, orderBy: { id: "desc" } }),
    searchParams,
  ]);
  return (
    <main className="shell main-space">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div><h1 className="title">Produkte</h1><p className="muted mt-3">Preise, Inhaltsstoffe und Kennzeichnungen im Überblick.</p></div>
        <Link href="/produkte/neu" className="primary"><Plus size={19} aria-hidden="true" /> Produkt erfassen</Link>
      </div>
      {query.gespeichert === "1" && <p className="notice mb-5" role="status"><Check size={18} aria-hidden="true" /> Produkt gespeichert.</p>}
      {products.length === 0 ? (
        <section className="panel grid justify-items-center px-6 py-16 text-center">
          <span className="brand-mark mb-5"><Package size={25} aria-hidden="true" /></span>
          <h2 className="section-title mb-2">Noch keine Produkte</h2>
          <p className="muted max-w-sm">Erfasse dein erstes Produkt, um es hier mit Preisen und Inhaltsstoffen zu sehen.</p>
        </section>
      ) : (
        <section className="panel overflow-hidden">
          <div className="overflow-x-auto focus-visible:outline-offset-[-3px]" tabIndex={0} role="region" aria-label="Produktübersicht">
            <table className="w-full min-w-[720px] text-left">
              <thead><tr>
                <th scope="col">Nr.</th><th scope="col">Produkt</th><th scope="col">Kategorie</th>
                <th scope="col" className="text-right">Privatkunden</th><th scope="col" className="text-right">Händler</th>
                <th scope="col">Kennzeichnung</th>
              </tr></thead>
              <tbody>{products.map(product => (
                <tr key={product.id}>
                  <td className="muted tabular-nums">{product.id}</td>
                  <td><div className="font-bold">{product.name}</div><div className="muted mt-1 max-w-xs text-sm">{product.description}</div>
                    <div className="muted mt-1 text-sm tabular-nums">{product.productionMinutes} Min. Herstellung</div></td>
                  <td>{product.category}</td>
                  <td className="text-right tabular-nums">{euros.format(product.retailPriceCents / 100)}</td>
                  <td className="text-right tabular-nums">{euros.format(product.wholesalePriceCents / 100)}</td>
                  <td><div className="flex flex-wrap gap-1.5">
                    {product.vegan && <span className="badge">Vegan</span>}
                    {hasAllergen(product.ingredients) && <span className="badge warning">Enthält Allergene</span>}
                    {!product.vegan && !hasAllergen(product.ingredients) && <span aria-label="Keine Kennzeichnung">—</span>}
                  </div>
                  {product.ingredients.length > 0 && <p className="muted mt-2 max-w-xs text-sm">
                    {product.ingredients.map(item => item.isAllergen ? `${item.name} (Allergen)` : item.name).join(", ")}
                  </p>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
