-- AlterTable
ALTER TABLE "businesses" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "description" TEXT;
