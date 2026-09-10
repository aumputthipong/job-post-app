import { z } from "zod";
import { postKindSchema } from "./comment";

/** Shared shape for FavoriteJobs docs. */
export const favoriteSchema = z.object({
  postId: z.string().min(1),
  userId: z.string().min(1),
});

/** Body accepted by POST /favorites/toggle — userId comes from the auth token. */
export const toggleFavoriteSchema = z.object({
  postKind: postKindSchema,
  postId: z.string().min(1),
});

export type Favorite = z.infer<typeof favoriteSchema>;
export type ToggleFavoriteInput = z.infer<typeof toggleFavoriteSchema>;
