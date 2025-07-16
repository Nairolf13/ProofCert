/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `transactionHash` on the `proofs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "proofs" DROP COLUMN "transactionHash",
ADD COLUMN     "hashMvx" TEXT;
