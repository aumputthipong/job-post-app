import { z } from "zod";

const optionalText = z.string().trim().default("");

/** Firestore doc shape for COLLECTIONS.USER_INFO, doc id = Firebase Auth uid.
 *  Messages are Thai: the API's 400s and the app's form show them as-is. */
export const userProfileSchema = z.object({
  email: z.string().email(),
  firstName: z.string().trim().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().trim().min(1, "กรุณากรอกนามสกุล"),
  job: optionalText,
  aboutme: optionalText,
  phone: optionalText,
  line: optionalText,
  facebook: optionalText,
  bachelor: optionalText,
  master: optionalText,
  doctoral: optionalText,
  /** The avatar. Named imageUrl because that is the field the existing
   *  documents already use — every screen reads user.imageUrl. */
  imageUrl: z.string().url().optional(),
  imagePublicId: z.string().optional(),
});

/** Fields a user is allowed to self-edit via PUT /users/me. Email belongs to
 *  Firebase Auth, so it isn't one of them. */
export const updateUserProfileSchema = userProfileSchema
  .omit({ email: true })
  .partial();

export type UserProfile = z.infer<typeof userProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
