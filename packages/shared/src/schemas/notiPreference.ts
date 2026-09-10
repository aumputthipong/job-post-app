import { z } from "zod";

/** Firestore doc shape for COLLECTIONS.USER_NOTI (one doc per user). */
export const notiPreferenceSchema = z.object({
  category: z.array(z.string()).default([]),
  notiBy: z.string().min(1),
});

/** Body accepted by PUT /users/me/noti-preferences — notiBy set from the auth token. */
export const updateNotiPreferenceSchema = z.object({
  category: z.array(z.string()),
});

export type NotiPreference = z.infer<typeof notiPreferenceSchema>;
export type UpdateNotiPreferenceInput = z.infer<typeof updateNotiPreferenceSchema>;
