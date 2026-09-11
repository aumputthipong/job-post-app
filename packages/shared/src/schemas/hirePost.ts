import { z } from "zod";

const required = (message: string) => z.string().trim().min(1, message);

/** Firestore doc shape for COLLECTIONS.HIRE_POSTS, as written by the legacy app.
 *  Messages are Thai: the API's 400s and the app's forms show them as-is. */
export const hirePostSchema = z.object({
  hireTitle: required("กรุณากรอกหัวข้อประกาศ"),
  resumeUrl: z.string().url().optional(),
  /** Cloudinary public_id, needed to delete the file when the post is deleted.
   *  Absent on posts created before the move off Firebase Storage. */
  resumePublicId: z.string().optional(),
  category: required("กรุณาเลือกประเภทงาน"),
  detail: required("กรุณากรอกรายละเอียด"),
  postById: z.string().min(1),
  phone: required("กรุณากรอกเบอร์โทรศัพท์"),
  email: z.string().trim().email("กรุณากรอกอีเมลให้ถูกต้อง"),
});

export const createHirePostSchema = hirePostSchema.omit({ postById: true });
export const updateHirePostSchema = createHirePostSchema.partial();

export type HirePost = z.infer<typeof hirePostSchema>;
export type CreateHirePostInput = z.infer<typeof createHirePostSchema>;
export type UpdateHirePostInput = z.infer<typeof updateHirePostSchema>;
