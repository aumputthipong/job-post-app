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
  /** The pay, or the bottom of the range when wageMax is set. */
  wage: required("กรุณากรอกค่าจ้าง"),
  wageMax: z.string().trim().regex(/^\d*$/, "กรุณากรอกค่าจ้างเป็นตัวเลข").optional(),
  detail: required("กรุณากรอกรายละเอียดงาน"),
  category: required("กรุณาเลือกประเภทงาน"),
  /** How often the wage is paid (รายเดือน, รายวัน…) — the legacy field name. */
  employmentType: required("กรุณาเลือกประเภทการจ้าง"),
  // Added with the step-by-step form; older posts don't have them.
  jobType: z.string().trim().optional(),
  workModel: z.string().trim().optional(),
  location: z.string().trim().max(120).optional(),
  openings: z.number().int().min(1, "รับอย่างน้อย 1 อัตรา").max(999).optional(),
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
