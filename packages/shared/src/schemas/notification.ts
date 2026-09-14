import { z } from "zod";
import { postKindSchema } from "./comment.js";

export const notificationTypeSchema = z.enum(["new_post", "comment", "rating"]);

/**
 * Firestore doc shape for COLLECTIONS.NOTIFICATIONS. One row per recipient,
 * type and post (doc id `${userId}_${type}_${postId}`): repeated events update
 * the row instead of adding rows, the way Facebook groups "and 9 others".
 */
export const notificationSchema = z.object({
  userId: z.string().min(1),
  type: notificationTypeSchema,
  postKind: postKindSchema,
  postId: z.string().min(1),
  postTitle: z.string(),
  /** Who acted, most recent first, capped at MAX_NOTIFICATION_ACTORS. */
  actorIds: z.array(z.string()),
  /** Distinct people since the recipient last read the row. */
  actorCount: z.number().int().min(1),
  read: z.boolean(),
});

export const MAX_NOTIFICATION_ACTORS = 10;

export const notificationId = (userId: string, type: NotificationType, postId: string) =>
  `${userId}_${type}_${postId}`;

export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type Notification = z.infer<typeof notificationSchema>;
