import { z } from "zod";

/** Firestore doc shape for COLLECTIONS.JOB_POSTS, as written by the legacy app. */
export const jobPostSchema = z.object({
  jobTitle: z.string().min(1),
  position: z.string().min(1),
  agency: z.string().min(1),
  attributes: z.array(z.string()).default([]),
  welfareBenefits: z.array(z.string()).default([]),
  imageUrl: z.string().url().optional(),
  /** Cloudinary public_id, needed to delete the image when the post is deleted.
   *  Absent on posts created before the move off Firebase Storage. */
  imagePublicId: z.string().optional(),
  wage: z.string().min(1),
  detail: z.string().min(1),
  category: z.string().min(1),
  employmentType: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  postById: z.string().min(1),
});

/** Body accepted by POST /posts/find — createdAt/postById are set server-side. */
export const createJobPostSchema = jobPostSchema.omit({ postById: true });
export const updateJobPostSchema = createJobPostSchema.partial();

export type JobPost = z.infer<typeof jobPostSchema>;
export type CreateJobPostInput = z.infer<typeof createJobPostSchema>;
export type UpdateJobPostInput = z.infer<typeof updateJobPostSchema>;
