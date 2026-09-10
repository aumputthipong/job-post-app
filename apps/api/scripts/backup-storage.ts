/**
 * Downloads every object in the Firebase Storage bucket to a local folder.
 *
 * STATUS: does not currently work. The project is on the Spark plan with no
 * billing account, which blocks object DATA access at the GCS level:
 *
 *   - client endpoint  -> 402 Payment Required
 *   - Admin SDK read   -> "billing account ... is disabled in state absent"
 *   - signed URL       -> 403 UserProjectAccountProblem
 *
 * Only object metadata (names, sizes) is still readable, which is why
 * getFiles() succeeds while createReadStream() fails. The 53 objects
 * (36.7 MB) are intact but unreachable until a billing account is attached.
 *
 * Kept for the day billing is enabled — run it first thing to get the
 * originals out, then migrate them off Firebase Storage for good.
 *
 * Run with: npx tsx scripts/backup-storage.ts <output-dir>
 */
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { storage } from "../src/firebaseAdmin.js";

const BUCKET = "log-in-d8f2c.appspot.com";

async function main() {
  const outDir = process.argv[2];
  if (!outDir) throw new Error("usage: tsx scripts/backup-storage.ts <output-dir>");

  const bucket = storage.bucket(BUCKET);
  const [files] = await bucket.getFiles();

  let done = 0;
  let bytes = 0;
  for (const file of files) {
    // Skip the zero-byte placeholder objects the console creates for folders.
    if (file.name.endsWith("/")) continue;

    const dest = path.join(outDir, file.name);
    await mkdir(path.dirname(dest), { recursive: true });
    await pipeline(file.createReadStream(), createWriteStream(dest));

    done += 1;
    bytes += Number(file.metadata.size ?? 0);
    console.log(`  [${done}] ${file.name}`);
  }

  console.log(`\nDownloaded ${done} objects (${(bytes / 1024 / 1024).toFixed(1)} MB) to ${outDir}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e?.message ?? e);
    process.exit(1);
  });
