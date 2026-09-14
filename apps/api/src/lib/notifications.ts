import {
  COLLECTIONS,
  MAX_NOTIFICATION_ACTORS,
  type NotificationType,
  notificationId,
  type PostKind,
} from "@jobapp-platform/shared";
import type { FastifyBaseLogger } from "fastify";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../firebaseAdmin.js";

type Post = { kind: PostKind; id: string; title: string; ownerId: string };

const notifications = () => db.collection(COLLECTIONS.NOTIFICATIONS);

/**
 * Everything here runs after the post, comment or rating is saved and must
 * never fail that request: a missed notification is logged, not returned.
 */
async function safely(log: FastifyBaseLogger, what: string, work: () => Promise<void>) {
  try {
    await work();
  } catch (err) {
    log.error({ err }, `notification not written: ${what}`);
  }
}

/**
 * Adds `actorId` to the recipient's row for this post, creating it if needed.
 * An unread row gathers actors; a read one starts over, so "สมชาย และอีก 9 คน"
 * means people since you last looked.
 */
async function group(recipient: string, type: NotificationType, post: Post, actorId: string) {
  const ref = notifications().doc(notificationId(recipient, type, post.id));

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const row = snap.data();
    const fresh = !row || row.read;
    const previous: string[] = fresh ? [] : row.actorIds;
    const isNewActor = !previous.includes(actorId);

    tx.set(ref, {
      userId: recipient,
      type,
      postKind: post.kind,
      postId: post.id,
      postTitle: post.title,
      actorIds: [actorId, ...previous.filter((id) => id !== actorId)].slice(0, MAX_NOTIFICATION_ACTORS),
      actorCount: fresh ? 1 : row.actorCount + (isNewActor ? 1 : 0),
      read: false,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}

/** Someone commented on a post: tell its owner, unless they wrote it. */
export function notifyComment(log: FastifyBaseLogger, post: Post, commenterId: string) {
  if (commenterId === post.ownerId) return Promise.resolve();
  return safely(log, "comment", () => group(post.ownerId, "comment", post, commenterId));
}

/**
 * Someone rated a post. A first rating counts them in; changing their stars
 * later adds nobody new, it only brings the row back to the top as unread.
 */
export function notifyRating(log: FastifyBaseLogger, post: Post, raterId: string) {
  if (raterId === post.ownerId) return Promise.resolve();
  return safely(log, "rating", () => group(post.ownerId, "rating", post, raterId));
}

/** A new post: tell everyone who follows its category, except its author. */
export function notifyNewPost(log: FastifyBaseLogger, post: Post, category: string) {
  return safely(log, "new post", async () => {
    const followers = await db.collection(COLLECTIONS.USER_NOTI).where("category", "array-contains", category).get();
    const recipients = [...new Set(followers.docs.map((doc) => doc.data().notiBy as string))].filter(
      (uid) => uid && uid !== post.ownerId,
    );

    for (let i = 0; i < recipients.length; i += 400) {
      const batch = db.batch();
      for (const recipient of recipients.slice(i, i + 400)) {
        batch.set(notifications().doc(notificationId(recipient, "new_post", post.id)), {
          userId: recipient,
          type: "new_post",
          postKind: post.kind,
          postId: post.id,
          postTitle: post.title,
          actorIds: [post.ownerId],
          actorCount: 1,
          read: false,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      await batch.commit();
    }
  });
}

/** The post is gone, so rows pointing at it would only lead to "not found". */
export async function notificationRefsForPost(postId: string) {
  const snap = await notifications().where("postId", "==", postId).get();
  return snap.docs.map((doc) => doc.ref);
}

export const postTitle = (kind: PostKind, data: FirebaseFirestore.DocumentData) =>
  String((kind === "find" ? data.jobTitle : data.hireTitle) ?? "");
