"use client";

import { Plus, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { saveProduct } from "./actions";

const fields = [
  { name: "name", label: "Produktname" },
  { name: "category", label: "Kategorie" },
  { name: "description", label: "Beschreibung" },
  { name: "productionMinutes", label: "Herstellungsdauer (Minuten)", mode: "numeric" },
  { name: "retailPrice", label: "Privatkundenpreis (€)", mode: "decimal" },
  { name: "wholesalePrice", label: "Händlerpreis (€)", mode: "decimal" },
] as const;

export function ProductForm({ ingredients }: {
  ingredients: { id: number; name: string; isAllergen: boolean }[];
}) {
  const [errors, action, pending] = useActionState(saveProduct, {});
  const [values, setValues] = useState<Record<string, string>>({});
  const [vegan, setVegan] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [drafts, setDrafts] = useState<{ key: number; name: string; allergen: boolean }[]>([]);
  const [nextKey, setNextKey] = useState(0);
  const [search, setSearch] = useState("");

  function field({ name, label, ...options }: typeof fields[number]) {
    const props = {
      className: "input", id: name, name, required: true, value: values[name] ?? "",
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setValues(current => ({ ...current, [name]: event.target.value })),
      "aria-invalid": !!errors[name],
      "aria-describedby": errors[name] ? `${name}-error` : undefined,
    };
    return (
      <div key={name} className={name === "description" ? "sm:col-span-2" : ""}>
        <label className="field" htmlFor={name}>{label} <span aria-hidden="true">*</span></label>
        {name === "description" ? <textarea {...props} rows={4} /> :
          <input {...props} inputMode={"mode" in options ? options.mode : undefined} />}
        {errors[name] && <p id={`${name}-error`} role="alert" className="error">{errors[name]}</p>}
      </div>
    );
  }

  const visible = ingredients.filter(item =>
    selected.includes(item.id) || item.name.toLocaleLowerCase("de").includes(search.toLocaleLowerCase("de")),
  );
  return (
    <form action={action} onReset={event => event.preventDefault()} className="space-y-5">
      <section className="panel space-y-5 p-6 sm:p-8" aria-labelledby="product-heading">
        <h2 className="section-title" id="product-heading">Produktdaten</h2>
        <div className="grid gap-5 sm:grid-cols-2">{fields.slice(0, 4).map(field)}</div>
        <label className="check"><input name="vegan" type="checkbox" checked={vegan}
          onChange={event => setVegan(event.target.checked)} /> Vegan</label>
      </section>
      <section className="panel space-y-5 p-6 sm:p-8" aria-labelledby="price-heading">
        <h2 className="section-title" id="price-heading">Preise</h2>
        <div className="grid gap-5 sm:grid-cols-2">{fields.slice(4).map(field)}</div>
      </section>
      <section className="panel space-y-5 p-6 sm:p-8" aria-labelledby="ingredient-heading">
        <h2 className="section-title" id="ingredient-heading">Inhaltsstoffe</h2>
        {ingredients.length > 0 ? (
          <>
            <label className="field" htmlFor="ingredient-search">Vorhandene Inhaltsstoffe suchen</label>
            <input className="input" id="ingredient-search" type="search" value={search}
              onChange={event => setSearch(event.target.value)} />
            {visible.length === 0 && <p className="muted">Keine passenden Inhaltsstoffe gefunden.</p>}
            <ul className="divide-y divide-[var(--line)]">
              {visible.map(item => <li key={item.id} className="py-3">
                <label className="check">
                  <input type="checkbox" name="ingredient" value={item.id} checked={selected.includes(item.id)}
                    onChange={event => setSelected(current => event.target.checked
                      ? [...current, item.id] : current.filter(id => id !== item.id))} />
                  {item.name} {item.isAllergen && <span className="badge warning">Allergen</span>}
                </label>
              </li>)}
            </ul>
          </>
        ) : <p className="muted">Es sind noch keine Inhaltsstoffe erfasst.</p>}
        {drafts.map((draft, index) => {
          const error = errors[`newIngredient-${index}`];
          function update(changes: Partial<typeof draft>) {
            setDrafts(current => current.map(item => item.key === draft.key ? { ...item, ...changes } : item));
          }
          return <div className="rounded-xl border border-[var(--line)] p-4" key={draft.key}>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <label className="field" htmlFor={`ingredient-${draft.key}`}>Name des Inhaltsstoffs <span aria-hidden="true">*</span></label>
                <input className="input" id={`ingredient-${draft.key}`} name="newIngredient" required
                  value={draft.name} onChange={event => update({ name: event.target.value })}
                  aria-invalid={!!error} aria-describedby={error ? `ingredient-error-${draft.key}` : undefined} />
                {error && <p className="error" role="alert" id={`ingredient-error-${draft.key}`}>{error}</p>}
              </div>
              <button type="button" className="quiet mt-6 p-3" aria-label="Inhaltsstoff entfernen"
                onClick={() => setDrafts(current => current.filter(item => item.key !== draft.key))}><Trash2 size={18} /></button>
            </div>
            <label className="check mt-3"><input type="checkbox" name={`allergen-${index}`}
              checked={draft.allergen} onChange={event => update({ allergen: event.target.checked })} /> Als Allergen kennzeichnen</label>
          </div>;
        })}
        {errors.ingredients && <p className="error" role="alert">{errors.ingredients}</p>}
        <button type="button" className="quiet" onClick={() => {
          setDrafts(current => [...current, { key: nextKey, name: "", allergen: false }]);
          setNextKey(current => current + 1);
        }}><Plus size={18} /> Inhaltsstoff hinzufügen</button>
      </section>
      {errors.form && <p className="error" role="alert">{errors.form}</p>}
      <div className="flex justify-end">
        <button className="primary" disabled={pending}>{pending ? "Speichert …" : "Produkt speichern"}</button>
      </div>
    </form>
  );
}
