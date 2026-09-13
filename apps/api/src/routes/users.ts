import type { FastifyInstance } from "fastify";
import { FieldValue } from "firebase-admin/firestore";
import {
  COLLECTIONS,
  updateNotiPreferenceSchema,
  updateUserProfileSchema,
} from "@jobapp-platform/shared";
import { db } from "../firebaseAdmin.js";
import { deleteImage, isOwnUpload } from "../lib/cloudinary.js";
import { requireAuth } from "../plugins/auth.js";

/**
 * Replaces the "User Info" / "User Noti" writes in MyProFileScreen.js and
 * EditNoti.js. The target document is always the caller's own — the legacy
 * code took the uid from the client and wrote wherever it was told.
 */
export async function usersRoutes(app: FastifyInstance) {
  app.get("/users/me", { preHandler: requireAuth }, async (request, reply) => {
    const snap = await db.collection(COLLECTIONS.USER_INFO).doc(request.userId!).get();
    if (!snap.exists) {
      return reply.code(404).send({ error: "ไม่พบโปรไฟล์ของคุณ" });
    }
    return reply.send({ id: snap.id, ...snap.data() });
  });

  app.put("/users/me", { preHandler: requireAuth }, async (request, reply) => {
    const parsed = updateUserProfileSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const ref = db.collection(COLLECTIONS.USER_INFO).doc(request.userId!);
    const snap = await ref.get();

    // A new avatar must be the caller's own upload: replacing it deletes the old
    // file, so claiming someone else's would let you delete theirs.
    const { imageUrl, imagePublicId } = parsed.data;
    const changingAvatar = imageUrl !== undefined || imagePublicId !== undefined;
    if (changingAvatar && !isOwnUpload({ url: imageUrl ?? "", publicId: imagePublicId }, "profiles", request.userId!)) {
      return reply.code(403).send({ error: "ใช้ได้เฉพาะรูปที่คุณอัปโหลดเอง" });
    }

    await ref.set(
      { ...parsed.data, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );

    // Replacing the avatar? Remove the old one instead of orphaning it.
    const previousImageId = snap.data()?.imagePublicId;
    if (previousImageId && imagePublicId && previousImageId !== imagePublicId) {
      const removed = await deleteImage(previousImageId);
      if (!removed) request.log.warn({ previousImageId }, "old avatar not deleted");
    }

    return reply.send({ id: request.userId });
  });

  app.get("/users/me/noti-preferences", { preHandler: requireAuth }, async (request, reply) => {
    const snap = await db
      .collection(COLLECTIONS.USER_NOTI)
      .where("notiBy", "==", request.userId!)
      .limit(1)
      .get();

    if (snap.empty) {
      return reply.send({ category: [], notiBy: request.userId });
    }
    return reply.send({ id: snap.docs[0]!.id, ...snap.docs[0]!.data() });
  });

  app.put("/users/me/noti-preferences", { preHandler: requireAuth }, async (request, reply) => {
    const parsed = updateNotiPreferenceSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const collection = db.collection(COLLECTIONS.USER_NOTI);
    const existing = await collection.where("notiBy", "==", request.userId!).limit(1).get();

    // The legacy reducer read the doc id from the wrong field (`.id` on an
    // object that only had `docId`), so updates silently created duplicates
    // instead of editing the existing row. One row per user is enforced here.
    if (existing.empty) {
      const doc = await collection.add({
        category: parsed.data.category,
        notiBy: request.userId!,
      });
      return reply.send({ id: doc.id, ...parsed.data });
    }

    await existing.docs[0]!.ref.update({ category: parsed.data.category });
    return reply.send({ id: existing.docs[0]!.id, ...parsed.data });
  });
}
