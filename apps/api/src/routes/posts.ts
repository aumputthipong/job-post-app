import type { FastifyInstance, FastifyRequest } from "fastify";
import { FieldValue } from "firebase-admin/firestore";
import {
  COLLECTIONS,
  createHirePostSchema,
  createJobPostSchema,
  type Media,
  postImages,
  updateHirePostSchema,
  updateJobPostSchema,
} from "@jobapp-platform/shared";
import { db } from "../firebaseAdmin.js";
import { deleteImage, isOwnUpload } from "../lib/cloudinary.js";
import { notificationRefsForPost, notifyNewPost, postTitle } from "../lib/notifications.js";
import { requireAuth } from "../plugins/auth.js";
import { rateLimit } from "../plugins/rate-limit.js";

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
  },
  hire: {
    collection: COLLECTIONS.HIRE_POSTS,
    createSchema: createHirePostSchema,
    updateSchema: updateHirePostSchema,
  },
} as const;

// Old posts keep one image in these; saving `images` replaces them.
const LEGACY_IMAGE_FIELDS = ["imageUrl", "imagePublicId", "resumeUrl", "resumePublicId"];

const NOT_YOUR_IMAGE = "ใช้ได้เฉพาะรูปที่คุณอัปโหลดเอง";

export async function postsRoutes(app: FastifyInstance) {
  for (const kind of ["find", "hire"] as PostKind[]) {
    const { collection, createSchema, updateSchema } = CONFIG[kind];
    // Each new post notifies everyone following its category.
    const limitPosts = rateLimit(`posts/${kind}`, 5);

    app.post(`/posts/${kind}`, { preHandler: [requireAuth, limitPosts] }, async (request, reply) => {
      const parsed = createSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.flatten() });
      }
      const images = parsed.data.images ?? [];
      if (!images.every((image) => isOwnUpload(image, "posts", request.userId!))) {
        return reply.code(403).send({ error: NOT_YOUR_IMAGE });
      }

      const doc = await db.collection(collection).add({
        ...parsed.data,
        images,
        postById: request.userId!,
        createdAt: FieldValue.serverTimestamp(),
      });

      await notifyNewPost(request.log, { kind, id: doc.id, title: postTitle(kind, parsed.data), ownerId: request.userId! }, parsed.data.category);
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

      const update: Record<string, unknown> = { ...parsed.data, updatedAt: FieldValue.serverTimestamp() };
      let removed: Media[] = [];
      if (parsed.data.images) {
        const replaced = replaceImages(postImages(snap.data()!), parsed.data.images, request.userId!);
        if (!replaced) return reply.code(403).send({ error: NOT_YOUR_IMAGE });
        update.images = replaced.next;
        removed = replaced.removed;
        for (const field of LEGACY_IMAGE_FIELDS) update[field] = FieldValue.delete();
      }

      await ref.update(update);
      // Only once the post no longer points at them.
      await deleteMedia(request, removed);
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

      await deletePostAndDependents(collection, id, kind);
      await deleteMedia(request, postImages(snap.data()!));
      return reply.send({ id, deleted: true });
    });
  }
}

/**
 * Works out a post's new image list. Images already on the post are matched by
 * url and keep their stored publicId — whatever the client sent for them is
 * ignored, so a later removal can't be pointed at some other file. New images
 * must be the caller's own uploads; null if any isn't. `removed` are the images
 * dropped from the list, to delete once the post is saved.
 */
function replaceImages(previous: Media[], incoming: Media[], uid: string) {
  const stored = new Map(previous.map((image) => [image.url, image]));
  const next: Media[] = [];
  for (const image of incoming) {
    const existing = stored.get(image.url);
    if (existing) next.push(existing);
    else if (isOwnUpload(image, "posts", uid)) next.push(image);
    else return null;
  }

  const kept = new Set(next.map((image) => image.url));
  return { next, removed: previous.filter((image) => !kept.has(image.url)) };
}

async function deleteMedia(request: FastifyRequest, images: Media[]) {
  for (const { publicId } of images) {
    if (!publicId) continue;
    const removed = await deleteImage(publicId);
    if (!removed) request.log.warn({ publicId }, "media not deleted, continuing");
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

  const refs = [db.collection(collection).doc(postId)];

  for (const dependent of dependents) {
    const snap = await db.collection(dependent).where("postId", "==", postId).get();
    snap.docs.forEach((doc) => refs.push(doc.ref));
  }
  refs.push(...(await notificationRefsForPost(postId)));

  // A write batch takes at most 500 operations, and a post with many comments,
  // ratings and favourites can pass that.
  for (let i = 0; i < refs.length; i += 400) {
    const batch = db.batch();
    refs.slice(i, i + 400).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}
