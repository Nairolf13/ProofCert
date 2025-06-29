-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "area" DOUBLE PRECISION,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "region" TEXT;
