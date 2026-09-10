import type { FastifyInstance } from "fastify";
import { uploadImage } from "../lib/cloudinary.js";
import { requireAuth } from "../plugins/auth.js";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_FOLDERS = new Set(["posts", "profiles"]);

/**
 * Replaces the client-side firebase.storage().put() calls in CreateFind.js,
 * CreateHire.js, MyProFileScreen.js and both detail screens.
 *
 * Uploading through the server means the storage credentials stay server-side
 * and the file is validated before it is stored — the old flow let the client
 * write anything of any size straight into the bucket.
 */
export async function uploadsRoutes(app: FastifyInstance) {
  app.post("/uploads", { preHandler: requireAuth }, async (request, reply) => {
    const file = await request.file({ limits: { fileSize: MAX_BYTES } });

    if (!file) {
      return reply.code(400).send({ error: "Expected a multipart file field" });
    }
    if (!file.mimetype.startsWith("image/")) {
      return reply.code(415).send({ error: `Expected an image, got ${file.mimetype}` });
    }

    // `folder` is an optional text field sent alongside the file.
    const requested = (file.fields.folder as any)?.value;
    const folder = ALLOWED_FOLDERS.has(requested) ? requested : "posts";

    let buffer: Buffer;
    try {
      buffer = await file.toBuffer();
    } catch (err) {
      request.log.warn({ err }, "upload rejected");
      return reply.code(413).send({ error: `File exceeds the ${MAX_BYTES} byte limit` });
    }

    const uploaded = await uploadImage(buffer, `jobapp/${folder}`);
    return reply.send(uploaded);
  });
}
