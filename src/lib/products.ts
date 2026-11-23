import { db } from "./db";

export function hasAllergen(ingredients: { isAllergen: boolean }[]) {
  return ingredients.some(ingredient => ingredient.isAllergen);
}

function priceInCents(value: string) {
  if (!/^\d+(?:[,.]\d{1,2})?$/.test(value)) return NaN;
  const [euros, cents = ""] = value.split(/[,.]/);
  return Number(euros) * 100 + Number(cents.padEnd(2, "0"));
}

export async function createProduct(form: FormData) {
  const errors: Record<string, string> = {};
  const read = (key: string) => String(form.get(key) ?? "").trim();
  const name = read("name");
  const category = read("category");
  const description = read("description");
  const retailPriceCents = priceInCents(read("retailPrice"));
  const wholesalePriceCents = priceInCents(read("wholesalePrice"));
  const minutes = read("productionMinutes");
  const productionMinutes = Number(minutes);
  const vegan = read("vegan") === "on";
  const isStoredInt = (value: number) => Number.isInteger(value) && value >= 0 && value <= 2_147_483_647;
  if (!name) errors.name = "Bitte gib einen Produktnamen ein.";
  if (!category) errors.category = "Bitte gib eine Kategorie ein.";
  if (!description) errors.description = "Bitte gib eine Beschreibung ein.";
  if (!isStoredInt(retailPriceCents)) errors.retailPrice = "Bitte gib einen gültigen Eurobetrag ein.";
  if (!isStoredInt(wholesalePriceCents)) errors.wholesalePrice = "Bitte gib einen gültigen Eurobetrag ein.";
  if (!/^\d+$/.test(minutes) || !isStoredInt(productionMinutes)) {
    errors.productionMinutes = "Bitte gib die Herstellungsdauer in ganzen Minuten ein.";
  }

  const ids = [...new Set(form.getAll("ingredient").map(Number))];
  const newIngredients = form.getAll("newIngredient").map((value, index) => ({
    name: String(value).trim(),
    isAllergen: form.get(`allergen-${index}`) === "on",
  }));
  if (!ids.every(id => isStoredInt(id) && id > 0)) errors.ingredients = "Bitte prüfe die ausgewählten Inhaltsstoffe.";
  newIngredients.forEach((ingredient, index) => {
    if (!ingredient.name) errors[`newIngredient-${index}`] = "Bitte gib den Namen des Inhaltsstoffs ein.";
  });
  if (Object.keys(errors).length) return errors;

  return db.$transaction(async transaction => {
    if (await transaction.ingredient.count({ where: { id: { in: ids } } }) !== ids.length) {
      return { ingredients: "Ein ausgewählter Inhaltsstoff wurde nicht gefunden." };
    }
    await transaction.product.create({
      data: {
        name, category, description, retailPriceCents, wholesalePriceCents, vegan, productionMinutes,
        ingredients: { connect: ids.map(id => ({ id })), create: newIngredients },
      },
    });
    return {};
  });
}
