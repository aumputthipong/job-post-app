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
  /** The avatar. Named imageUrl because that is the field the existing
   *  documents already use — every screen reads user.imageUrl. */
  imageUrl: z.string().url().optional(),
  imagePublicId: z.string().optional(),
});

/** Fields a user is allowed to self-edit via PUT /users/me. */
export const updateUserProfileSchema = userProfileSchema
  .omit({ email: true })
  .partial();

export type UserProfile = z.infer<typeof userProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
