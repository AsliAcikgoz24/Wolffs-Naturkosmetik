"use client";

export default function ProductsError({ reset }: { reset: () => void }) {
  return <main className="shell main-space"><section className="panel space-y-4 p-8">
    <h1 className="section-title">Die Produktdaten konnten nicht geladen werden.</h1>
    <button className="primary" onClick={reset}>Erneut versuchen</button>
  </section></main>;
}
