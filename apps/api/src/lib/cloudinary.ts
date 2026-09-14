import { randomUUID } from "node:crypto";
import { uploadFolder } from "@jobapp-platform/shared";
import { v2 as cloudinary } from "cloudinary";
import { usingEmulators } from "../firebaseAdmin.js";

/**
 * Media storage for the app.
 *
 * Firebase Storage is unusable on this project: it sits behind the Blaze plan
 * and the bucket has no billing account, so every read and write fails (402 to
 * clients, "billing account absent" to the Admin SDK). Rather than pay to
 * unlock a bucket we'd migrate away from anyway, uploads go to Cloudinary.
 *
 * The API secret must never reach the app, so uploads go through this server
 * rather than straight from the client the way firebase.storage() did.
 */
function configure() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return false;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  return true;
}

export const cloudinaryConfigured = configure();

export function assertCloudinary() {
  if (!cloudinaryConfigured) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY " +
        "and CLOUDINARY_API_SECRET in apps/api/.env (free account, no card required).",
    );
  }
}

// Cloudinary has no emulator, so local development still uploads for real.
// A separate root folder keeps those files apart from the real app's media
// and makes them easy to clear out.
export const MEDIA_ROOT = usingEmulators ? "jobapp-dev" : "jobapp";

/** Whether an image the client sent was uploaded by this user through POST /uploads. */
export function isOwnUpload(media: { url: string; publicId?: string }, folder: string, uid: string) {
  const { publicId, url } = media;
  return !!publicId && publicId.startsWith(`${uploadFolder(MEDIA_ROOT, folder, uid)}/`) && url.includes(`/${publicId}`);
}

export type UploadResult = { url: string; publicId: string };

/**
 * Uploads bytes and returns the CDN url plus the id needed to delete it later.
 *
 * PDFs go up as "raw" files. As images, Cloudinary rasterises every page on
 * upload, and the free plan answers that with 429 "Out of Processing
 * Capacity". A raw public id keeps its extension, so `.pdf` also tells
 * deleteImage which resource type to remove.
 */
export async function uploadImage(buffer: Buffer, folder: string, pdf = false): Promise<UploadResult> {
  assertCloudinary();

  const result = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      pdf ? { folder, resource_type: "raw", public_id: `${randomUUID()}.pdf` } : { folder, resource_type: "image" },
      (error, uploaded) => (error ? reject(error) : resolve(uploaded)),
    );
    stream.end(buffer);
  });

  return { url: result.secure_url, publicId: result.public_id };
}

/**
 * Best-effort delete. A post should still be deletable when its image is
 * already gone, so failures are reported to the caller rather than thrown.
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  assertCloudinary();
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: publicId.endsWith(".pdf") ? "raw" : "image",
    });
    return result.result === "ok" || result.result === "not found";
  } catch {
    return false;
  }
}

export { cloudinary };
