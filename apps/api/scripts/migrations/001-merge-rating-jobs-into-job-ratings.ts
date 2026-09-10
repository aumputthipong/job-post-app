/**
 * One-off data fix for the RatingJobs/JobRatings collection-name bug
 * (see MIGRATION.md #1). The legacy jobsReducer.js wrote Find-job ratings
 * to a collection literally named "RatingJobs" while data/Jobs-data.js
 * read from "JobRatings" — so those ratings were saved but never shown.
 *
 * This script copies every doc from "RatingJobs" into "JobRatings" (same
 * doc id, so running it twice is a no-op — set() overwrites identically),
 * verifies the copy, then deletes the source docs.
 *
 * Run once with: npx tsx scripts/migrations/001-merge-rating-jobs-into-job-ratings.ts
 * Already run on 2026-09-10 against the live project (18 docs migrated).
 */
import { db } from "../../src/firebaseAdmin.js";

const SOURCE = "RatingJobs";
const DEST = "JobRatings";

async function main() {
  const sourceSnap = await db.collection(SOURCE).get();
  console.log(`Found ${sourceSnap.size} docs in "${SOURCE}"`);

  if (sourceSnap.empty) {
    console.log("Nothing to migrate.");
    return;
  }

  const batch = db.batch();
  for (const doc of sourceSnap.docs) {
    batch.set(db.collection(DEST).doc(doc.id), doc.data());
  }
  await batch.commit();
  console.log(`Copied ${sourceSnap.size} docs into "${DEST}"`);

  // Verify every source id now exists in the destination before deleting.
  const destChecks = await Promise.all(
    sourceSnap.docs.map((doc) => db.collection(DEST).doc(doc.id).get()),
  );
  const missing = destChecks.filter((snap) => !snap.exists);
  if (missing.length > 0) {
    throw new Error(
      `Verification failed: ${missing.length} docs missing in "${DEST}" after copy. Aborting delete of source.`,
    );
  }
  console.log("Verified all copied docs exist in destination.");

  const deleteBatch = db.batch();
  for (const doc of sourceSnap.docs) {
    deleteBatch.delete(doc.ref);
  }
  await deleteBatch.commit();
  console.log(`Deleted ${sourceSnap.size} docs from "${SOURCE}". Migration complete.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
