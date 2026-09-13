import { z } from "zod";

export const MAX_POST_IMAGES = 10;

/** One uploaded file. publicId is absent only on images carried over from the
 *  legacy single-image fields, which predate Cloudinary. */
export const mediaSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1).optional(),
});

export const postImagesSchema = z
  .array(mediaSchema)
  .max(MAX_POST_IMAGES, `เพิ่มรูปได้สูงสุด ${MAX_POST_IMAGES} รูป`);

export type Media = z.infer<typeof mediaSchema>;

type LegacyImageFields = {
  images?: Media[];
  imageUrl?: string;
  imagePublicId?: string;
  resumeUrl?: string;
  resumePublicId?: string;
};

/**
 * A post's images, oldest shape included: posts written before several images
 * were allowed hold one image in imageUrl (jobs) or resumeUrl (freelance).
 */
export function postImages(post: LegacyImageFields): Media[] {
  if (post.images) return post.images;
  const url = post.imageUrl ?? post.resumeUrl;
  const publicId = post.imagePublicId ?? post.resumePublicId;
  return url ? [{ url, ...(publicId && { publicId }) }] : [];
}

/** Cloudinary folder a user's uploads go to, so the API can tell whose a file is. */
export const uploadFolder = (root: string, folder: string, uid: string) => `${root}/${folder}/${uid}`;
