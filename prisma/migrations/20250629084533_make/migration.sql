/*
  Warnings:

  - Made the column `area` on table `Property` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `Property` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country` on table `Property` required. This step will fail if there are existing NULL values in that column.
  - Made the column `price` on table `Property` required. This step will fail if there are existing NULL values in that column.
  - Made the column `region` on table `Property` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Property" ALTER COLUMN "area" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "price" SET NOT NULL,
ALTER COLUMN "region" SET NOT NULL;
