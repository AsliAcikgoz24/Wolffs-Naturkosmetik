-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "retailPriceCents" INTEGER NOT NULL,
    "wholesalePriceCents" INTEGER NOT NULL,
    "vegan" BOOLEAN NOT NULL,
    "productionMinutes" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isAllergen" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "_IngredientToProduct" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_IngredientToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Ingredient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_IngredientToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_IngredientToProduct_AB_unique" ON "_IngredientToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_IngredientToProduct_B_index" ON "_IngredientToProduct"("B");
