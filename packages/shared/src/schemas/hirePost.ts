import { z } from "zod";

/** Firestore doc shape for COLLECTIONS.HIRE_POSTS, as written by the legacy app. */
export const hirePostSchema = z.object({
  hireTitle: z.string().min(1),
  resumeUrl: z.string().url().optional(),
  category: z.string().min(1),
  detail: z.string().min(1),
  postById: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
});

export const createHirePostSchema = hirePostSchema.omit({ postById: true });
export const updateHirePostSchema = createHirePostSchema.partial();

export type HirePost = z.infer<typeof hirePostSchema>;
export type CreateHirePostInput = z.infer<typeof createHirePostSchema>;
export type UpdateHirePostInput = z.infer<typeof updateHirePostSchema>;
