import type { FastifyInstance } from "fastify";
import { FieldValue } from "firebase-admin/firestore";
import { COLLECTIONS, createCommentSchema, postKindSchema } from "@jobapp-platform/shared";
import { db } from "../firebaseAdmin.js";
import { notifyComment, postTitle } from "../lib/notifications.js";
import { requireAuth } from "../plugins/auth.js";
import { rateLimit } from "../plugins/rate-limit.js";

/**
 * Replaces the inline JobComments/HireComments writes in the two detail
 * screens. userId now comes from the verified token instead of the client,
 * so comments can't be posted under someone else's name.
 */
export async function commentsRoutes(app: FastifyInstance) {
  const limitComments = rateLimit("comments", 10);

  app.post("/comments/:postKind", { preHandler: [requireAuth, limitComments] }, async (request, reply) => {
    const kind = postKindSchema.safeParse((request.params as { postKind: string }).postKind);
    if (!kind.success) {
      return reply.code(400).send({ error: "postKind must be 'find' or 'hire'" });
    }

    const parsed = createCommentSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const postCollection =
      kind.data === "find" ? COLLECTIONS.JOB_POSTS : COLLECTIONS.HIRE_POSTS;
    const post = await db.collection(postCollection).doc(parsed.data.postId).get();
    if (!post.exists) {
      return reply.code(404).send({ error: "ไม่พบประกาศนี้ อาจถูกลบไปแล้ว" });
    }

    const collection =
      kind.data === "find" ? COLLECTIONS.JOB_COMMENTS : COLLECTIONS.HIRE_COMMENTS;
    const doc = await db.collection(collection).add({
      ...parsed.data,
      userId: request.userId!,
      createdAt: FieldValue.serverTimestamp(),
    });

    await notifyComment(
      request.log,
      { kind: kind.data, id: post.id, title: postTitle(kind.data, post.data()!), ownerId: post.data()!.postById },
      request.userId!,
    );
    return reply.code(201).send({ id: doc.id });
  });

  app.delete("/comments/:postKind/:id", { preHandler: requireAuth }, async (request, reply) => {
    const params = request.params as { postKind: string; id: string };
    const kind = postKindSchema.safeParse(params.postKind);
    if (!kind.success) {
      return reply.code(400).send({ error: "postKind must be 'find' or 'hire'" });
    }

    const collection =
      kind.data === "find" ? COLLECTIONS.JOB_COMMENTS : COLLECTIONS.HIRE_COMMENTS;
    const ref = db.collection(collection).doc(params.id);
    const snap = await ref.get();

    if (!snap.exists) {
      return reply.code(404).send({ error: "ไม่พบความคิดเห็นนี้" });
    }
    if (snap.data()!.userId !== request.userId) {
      return reply.code(403).send({ error: "ลบได้เฉพาะความคิดเห็นของตัวเอง" });
    }

    await ref.delete();
    return reply.send({ id: params.id, deleted: true });
  });
}
