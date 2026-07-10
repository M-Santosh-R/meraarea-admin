-- DropIndex
DROP INDEX "businesses_category_id_idx";

-- DropIndex
DROP INDEX "businesses_status_idx";

-- CreateIndex
CREATE INDEX "businesses_area_id_category_id_status_idx" ON "businesses"("area_id", "category_id", "status");

-- CreateIndex
CREATE INDEX "businesses_category_id_status_idx" ON "businesses"("category_id", "status");

-- CreateIndex
CREATE INDEX "businesses_status_created_at_idx" ON "businesses"("status", "created_at");
