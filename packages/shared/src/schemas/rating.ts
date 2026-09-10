import { z } from "zod";
import { postKindSchema } from "./comment.js";

/** Shared shape for JobRatings / HireRatings docs (one doc per user per post). */
export const ratingSchema = z.object({
  postId: z.string().min(1),
  userId: z.string().min(1),
  rating: z.number().min(1).max(5),
});

/** Body accepted by PUT /ratings — userId comes from the auth token, not the client. */
export const upsertRatingSchema = z.object({
  postKind: postKindSchema,
  postId: z.string().min(1),
  rating: z.number().min(1).max(5),
});

export type Rating = z.infer<typeof ratingSchema>;
export type UpsertRatingInput = z.infer<typeof upsertRatingSchema>;
