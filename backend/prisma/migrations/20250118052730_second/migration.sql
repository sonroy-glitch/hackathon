/*
  Warnings:

  - You are about to drop the column `companyId` on the `Rfq` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `Tender` table. All the data in the column will be lost.
  - You are about to drop the `Companies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Rfq" DROP CONSTRAINT "Rfq_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Tender" DROP CONSTRAINT "Tender_companyId_fkey";

-- AlterTable
ALTER TABLE "Rfq" DROP COLUMN "companyId";

-- AlterTable
ALTER TABLE "Tender" DROP COLUMN "companyId";

-- DropTable
DROP TABLE "Companies";
