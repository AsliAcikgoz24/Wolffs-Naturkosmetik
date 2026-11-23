import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";

const directory = mkdtempSync(join(tmpdir(), "wolffs-test-"));
let database: typeof import("../src/lib/db").db;
let products: typeof import("../src/lib/products");

before(async () => {
  process.env.DATABASE_URL = `file:${join(directory, "test.db")}`;
  execFileSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], { stdio: "pipe" });
  ({ db: database } = await import("../src/lib/db"));
  products = await import("../src/lib/products");
});
after(async () => {
  await database?.$disconnect();
  rmSync(directory, { recursive: true, force: true });
});

function productForm(name: string) {
  const form = new FormData();
  for (const [field, value] of Object.entries({
    name, category: "Pflege", description: "Milde Pflege", retailPrice: "12,95",
    wholesalePrice: "8.50", productionMinutes: "25", vegan: "on",
  })) form.set(field, value);
  return form;
}

test("Produktdaten und neue Inhaltsstoffe werden gespeichert und wiederverwendet", async () => {
  const first = productForm("Pflegebalsam");
  first.append("newIngredient", "Mandelöl");
  first.append("newIngredient", "Jojobaöl");
  first.set("allergen-0", "on");
  assert.deepEqual(await products.createProduct(first), {});
  const saved = await database.product.findFirstOrThrow({ where: { name: "Pflegebalsam" }, include: { ingredients: true } });
  assert.deepEqual(
    [saved.category, saved.description, saved.retailPriceCents, saved.wholesalePriceCents, saved.productionMinutes, saved.vegan],
    ["Pflege", "Milde Pflege", 1295, 850, 25, true],
  );
  const ingredient = saved.ingredients.find(item => item.name === "Mandelöl");
  assert.ok(ingredient?.isAllergen);
  const second = productForm("Handbalsam");
  second.set("ingredient", String(ingredient.id));
  assert.deepEqual(await products.createProduct(second), {});
  const reused = await database.ingredient.findUniqueOrThrow({ where: { id: ingredient.id }, include: { products: true } });
  assert.equal(reused.products.length, 2);
});

test("BR 4: Der Produkthinweis folgt den Allergenkennzeichnungen", () => {
  assert.equal(products.hasAllergen([{ isAllergen: false }, { isAllergen: true }]), true);
  assert.equal(products.hasAllergen([{ isAllergen: false }]), false);
  assert.equal(products.hasAllergen([]), false);
});

test("Fehlerhafte Angaben und ungültige Zuordnungen verändern die Datenbank nicht", async () => {
  const before = [await database.product.count(), await database.ingredient.count()];
  const invalid = productForm("");
  invalid.set("retailPrice", "3,123");
  invalid.set("description", "");
  invalid.set("newIngredient", "Hafer");
  assert.deepEqual(Object.keys(await products.createProduct(invalid)).sort(), ["description", "name", "retailPrice"]);
  const missing = productForm("Test");
  missing.set("ingredient", "2147483647");
  missing.set("newIngredient", "Hafer");
  assert.ok((await products.createProduct(missing)).ingredients);
  assert.deepEqual([await database.product.count(), await database.ingredient.count()], before);
});
