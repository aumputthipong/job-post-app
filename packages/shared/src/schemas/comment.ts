import { z } from "zod";

/** Shared shape for JobComments / HireComments docs. */
export const commentSchema = z.object({
  postId: z.string().min(1),
  userId: z.string().min(1),
  comment: z.string().min(1),
});

/** Body accepted by POST /comments — userId/createdAt set server-side from the auth token. */
export const createCommentSchema = commentSchema.omit({ userId: true });

export type Comment = z.infer<typeof commentSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

/** Which post-type a comment/rating/favorite request targets. */
export const postKindSchema = z.enum(["find", "hire"]);
export type PostKind = z.infer<typeof postKindSchema>;
