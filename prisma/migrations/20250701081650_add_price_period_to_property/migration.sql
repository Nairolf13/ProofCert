-- CreateEnum
CREATE TYPE "PricePeriod" AS ENUM ('DAY', 'WEEK', 'MONTH');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "pricePeriod" "PricePeriod" NOT NULL DEFAULT 'MONTH';
