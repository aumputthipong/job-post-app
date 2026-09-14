import { z } from "zod";
import { postImagesSchema } from "./media.js";

const required = (message: string) => z.string().trim().min(1, message);

/** Firestore doc shape for COLLECTIONS.JOB_POSTS, as written by the legacy app.
 *  Messages are Thai: the API's 400s and the app's forms show them as-is. */
export const jobPostSchema = z.object({
  jobTitle: required("กรุณากรอกหัวข้องาน"),
  position: required("กรุณากรอกตำแหน่งที่รับ"),
  agency: required("กรุณากรอกบริษัท / หน่วยงาน"),
  attributes: z.array(z.string()).default([]),
  welfareBenefits: z.array(z.string()).default([]),
  /** First one is the cover. Read through postImages(), which covers old posts. */
  images: postImagesSchema.optional(),
  /** Legacy single image, kept on old posts until they are edited. */
  imageUrl: z.string().url().optional(),
  imagePublicId: z.string().optional(),
  wage: required("กรุณากรอกค่าจ้าง"),
  detail: required("กรุณากรอกรายละเอียดงาน"),
  category: required("กรุณาเลือกประเภทงาน"),
  employmentType: required("กรุณาเลือกประเภทการจ้าง"),
  email: z.string().trim().email("กรุณากรอกอีเมลให้ถูกต้อง"),
  phone: required("กรุณากรอกเบอร์โทรศัพท์"),
  postById: z.string().min(1),
});

/** Body accepted by POST /posts/find — createdAt/postById are set server-side. */
export const createJobPostSchema = jobPostSchema.omit({ postById: true, imageUrl: true, imagePublicId: true });
export const updateJobPostSchema = createJobPostSchema.partial();

export type JobPost = z.infer<typeof jobPostSchema>;
export type CreateJobPostInput = z.infer<typeof createJobPostSchema>;
export type UpdateJobPostInput = z.infer<typeof updateJobPostSchema>;
