"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireNina } from "../../lib/auth";
import { createProduct } from "../../lib/products";

export async function saveProduct(_previous: Record<string, string>, form: FormData) {
  await requireNina();
  try {
    const errors = await createProduct(form);
    if (Object.keys(errors).length) return errors as Record<string, string>;
  } catch (error) {
    console.error("Produkt konnte nicht gespeichert werden", error);
    return { form: "Das Produkt konnte nicht gespeichert werden. Bitte versuche es erneut." };
  }
  revalidatePath("/produkte");
  redirect("/produkte?gespeichert=1");
}
