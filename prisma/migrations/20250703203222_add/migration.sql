-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "proofs" ADD COLUMN     "deletedAt" TIMESTAMP(3);
