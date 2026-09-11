import type { FastifyInstance } from "fastify";
import { FieldValue } from "firebase-admin/firestore";
import {
  COLLECTIONS,
  createHirePostSchema,
  createJobPostSchema,
  updateHirePostSchema,
  updateJobPostSchema,
} from "@jobapp-platform/shared";
import { db } from "../firebaseAdmin.js";
import { deleteImage } from "../lib/cloudinary.js";
import { requireAuth } from "../plugins/auth.js";

/**
 * Replaces the direct Firestore writes in CreateFind.js, CreateHire.js,
 * EditFind.js and EditHire.js.
 *
 * Two things the legacy code got wrong and this fixes:
 *  - postById came from the client, so nothing stopped a caller from posting
 *    as another user. It now comes from the verified ID token.
 *  - deleting a post deleted the Firestore doc but left its uploaded image
 *    orphaned in storage forever. Delete now cleans up the media too.
 */

type PostKind = "find" | "hire";

const CONFIG = {
  find: {
    collection: COLLECTIONS.JOB_POSTS,
    createSchema: createJobPostSchema,
    updateSchema: updateJobPostSchema,
    mediaIdField: "imagePublicId",
  },
  hire: {
    collection: COLLECTIONS.HIRE_POSTS,
    createSchema: createHirePostSchema,
    updateSchema: updateHirePostSchema,
    mediaIdField: "resumePublicId",
  },
} as const;

export async function postsRoutes(app: FastifyInstance) {
  for (const kind of ["find", "hire"] as PostKind[]) {
    const { collection, createSchema, updateSchema, mediaIdField } = CONFIG[kind];

    app.post(`/posts/${kind}`, { preHandler: requireAuth }, async (request, reply) => {
      const parsed = createSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.flatten() });
      }

      const doc = await db.collection(collection).add({
        ...parsed.data,
        postById: request.userId!,
        createdAt: FieldValue.serverTimestamp(),
      });

      return reply.code(201).send({ id: doc.id });
    });

    app.put(`/posts/${kind}/:id`, { preHandler: requireAuth }, async (request, reply) => {
      const { id } = request.params as { id: string };
      const parsed = updateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.flatten() });
      }

      const ref = db.collection(collection).doc(id);
      const snap = await ref.get();
      if (!snap.exists) {
        return reply.code(404).send({ error: "ไม่พบประกาศนี้ อาจถูกลบไปแล้ว" });
      }
      if (snap.data()!.postById !== request.userId) {
        return reply.code(403).send({ error: "แก้ไขได้เฉพาะประกาศของตัวเอง" });
      }

      // If the image is being replaced, drop the old one rather than orphaning it.
      const previousMediaId = snap.data()![mediaIdField];
      const incomingMediaId = (parsed.data as Record<string, unknown>)[mediaIdField];
      if (previousMediaId && incomingMediaId && previousMediaId !== incomingMediaId) {
        const removed = await deleteImage(previousMediaId);
        if (!removed) request.log.warn({ previousMediaId }, "old media not deleted");
      }

      await ref.update({ ...parsed.data, updatedAt: FieldValue.serverTimestamp() });
      return reply.send({ id });
    });

    app.delete(`/posts/${kind}/:id`, { preHandler: requireAuth }, async (request, reply) => {
      const { id } = request.params as { id: string };

      const ref = db.collection(collection).doc(id);
      const snap = await ref.get();
      if (!snap.exists) {
        return reply.code(404).send({ error: "ไม่พบประกาศนี้ อาจถูกลบไปแล้ว" });
      }
      if (snap.data()!.postById !== request.userId) {
        return reply.code(403).send({ error: "ลบได้เฉพาะประกาศของตัวเอง" });
      }

      const mediaId = snap.data()![mediaIdField];
      if (mediaId) {
        const removed = await deleteImage(mediaId);
        if (!removed) request.log.warn({ mediaId }, "media not deleted, continuing");
      }

      await deletePostAndDependents(collection, id, kind);
      return reply.send({ id, deleted: true });
    });
  }
}

/**
 * Deleting a post also removes the comments, ratings and favourites pointing at
 * it. The legacy app left all of those behind, so the app accumulated rows
 * referencing posts that no longer existed.
 */
async function deletePostAndDependents(collection: string, postId: string, kind: PostKind) {
  const dependents = [
    kind === "find" ? COLLECTIONS.JOB_COMMENTS : COLLECTIONS.HIRE_COMMENTS,
    kind === "find" ? COLLECTIONS.JOB_RATINGS : COLLECTIONS.HIRE_RATINGS,
    COLLECTIONS.FAVORITE_JOBS,
  ];

  const batch = db.batch();
  batch.delete(db.collection(collection).doc(postId));

  for (const dependent of dependents) {
    const snap = await db.collection(dependent).where("postId", "==", postId).get();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
  }

  await batch.commit();
}
