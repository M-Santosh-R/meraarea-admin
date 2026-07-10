import "dotenv/config";
import { createAdminClient } from "../src/lib/supabase/admin";

const BUCKET = "business-images";

async function main() {
  const supabase = createAdminClient();

  const { data: existing, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error(`Failed to list buckets: ${listError.message}`);
    process.exit(1);
  }

  if (existing?.some((bucket) => bucket.name === BUCKET)) {
    console.log(`Bucket "${BUCKET}" already exists — nothing to do.`);
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: "5MB",
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  });

  if (createError) {
    console.error(`Failed to create bucket "${BUCKET}": ${createError.message}`);
    process.exit(1);
  }

  console.log(`Created bucket "${BUCKET}" (public read).`);
}

main();
