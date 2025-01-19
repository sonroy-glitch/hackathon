/*
  Warnings:

  - Added the required column `companyId` to the `Rfq` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Tender` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Rfq" ADD COLUMN     "companyId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Tender" ADD COLUMN     "companyId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Companies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "about" TEXT NOT NULL,

    CONSTRAINT "Companies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Companies_id_key" ON "Companies"("id");

-- AddForeignKey
ALTER TABLE "Rfq" ADD CONSTRAINT "Rfq_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
