import { z } from "zod";

/** Firestore doc shape for COLLECTIONS.USER_INFO, doc id = Firebase Auth uid. */
export const userProfileSchema = z.object({
  email: z.string().email(),
  firstName: z.string().default(""),
  lastName: z.string().default(""),
  job: z.string().default(""),
  aboutme: z.string().default(""),
  phone: z.string().default(""),
  line: z.string().default(""),
  facebook: z.string().default(""),
  bachelor: z.string().default(""),
  master: z.string().default(""),
  doctoral: z.string().default(""),
  photoUrl: z.string().url().optional(),
  photoPublicId: z.string().optional(),
});

/** Fields a user is allowed to self-edit via PUT /users/me. */
export const updateUserProfileSchema = userProfileSchema
  .omit({ email: true })
  .partial();

export type UserProfile = z.infer<typeof userProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
