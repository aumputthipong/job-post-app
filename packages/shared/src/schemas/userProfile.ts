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
  /** The user's company, used to fill in a new job post. */
  companyName: optionalText,
  companyLocation: optionalText,
  companyEmail: z.union([z.literal(""), z.string().trim().email("กรุณากรอกอีเมลให้ถูกต้อง")]).default(""),
  companyPhone: optionalText,
  /** The avatar. Named imageUrl because that is the field the existing
   *  documents already use — every screen reads user.imageUrl. */
  imageUrl: z.string().url().optional(),
  imagePublicId: z.string().optional(),
  /** One PDF or image, shown on the profile and linked from freelance posts.
   *  null removes it. */
  resume: z
    .object({
      url: z.string().url(),
      publicId: z.string().min(1),
      /** The file's original name, for the button label. */
      name: z.string().max(200).optional(),
    })
    .nullable()
    .optional(),
});

export const isPdf = (url: string) => /\.pdf($|\?)/i.test(url);

/** Fields a user is allowed to self-edit via PUT /users/me. Email belongs to
 *  Firebase Auth, so it isn't one of them. */
export const updateUserProfileSchema = userProfileSchema
  .omit({ email: true })
  .partial();

export type UserProfile = z.infer<typeof userProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
