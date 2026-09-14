import { uploadFolder } from "@jobapp-platform/shared";
import type { FastifyInstance } from "fastify";
import { MEDIA_ROOT, uploadImage } from "../lib/cloudinary.js";
import { requireAuth } from "../plugins/auth.js";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_FOLDERS = new Set(["posts", "profiles", "resumes"]);

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
      return reply.code(400).send({ error: "ไม่พบไฟล์ที่อัปโหลด" });
    }
    // `folder` is an optional text field sent alongside the file.
    const requested = (file.fields.folder as any)?.value;
    const folder = ALLOWED_FOLDERS.has(requested) ? requested : "posts";

    // A résumé may also be a PDF; everything else is an image.
    const isImage = file.mimetype.startsWith("image/");
    const isResumePdf = folder === "resumes" && file.mimetype === "application/pdf";
    if (!isImage && !isResumePdf) {
      return reply
        .code(415)
        .send({ error: folder === "resumes" ? "รองรับเฉพาะไฟล์ PDF หรือรูปภาพ" : "รองรับเฉพาะไฟล์รูปภาพ" });
    }

    let buffer: Buffer;
    try {
      buffer = await file.toBuffer();
    } catch (err) {
      request.log.warn({ err }, "upload rejected");
      return reply.code(413).send({ error: "ไฟล์ใหญ่เกิน 10 MB" });
    }

    // One folder per user: a post may only claim images from its author's folder,
    // so nobody can attach (and later delete) someone else's upload.
    try {
      const uploaded = await uploadImage(buffer, uploadFolder(MEDIA_ROOT, folder, request.userId!), isResumePdf);
      return reply.send(uploaded);
    } catch (err) {
      // Cloudinary's own errors are English and say nothing useful to the user.
      request.log.error({ err }, "upload to Cloudinary failed");
      const busy = (err as { http_code?: number }).http_code === 429;
      return reply
        .code(busy ? 503 : 502)
        .send({ error: busy ? "ระบบรับไฟล์ไม่ทัน กรุณาลองใหม่อีกครั้ง" : "อัปโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่" });
    }
  });
}
