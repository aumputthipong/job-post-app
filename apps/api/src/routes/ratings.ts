import type { FastifyInstance } from "fastify";
import { COLLECTIONS, upsertRatingSchema } from "@jobapp-platform/shared";
import { db } from "../firebaseAdmin.js";
import { requireAuth } from "../plugins/auth.js";

/**
 * Replaces SCORE_RATING (jobsReducer.js) and HIRE_RATING (hireReducer.js).
 * The legacy write path used the string "RatingJobs" while the read path
 * (data/Jobs-data.js) listened on "JobRatings" — two different literals for
 * what was meant to be one collection, so Find-job ratings never showed up.
 * Both directions now go through COLLECTIONS.JOB_RATINGS, so that can't drift again.
 *
 * NOTE: if any real documents were ever written under the old "RatingJobs"
 * name, they need a one-time migration into "JobRatings" — check the
 * Firestore console before relying on this in production.
 */
export async function ratingsRoutes(app: FastifyInstance) {
  app.put("/ratings", { preHandler: requireAuth }, async (request, reply) => {
    const parsed = upsertRatingSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }
    const { postKind, postId, rating } = parsed.data;
    const userId = request.userId!;
    const collectionName = postKind === "find" ? COLLECTIONS.JOB_RATINGS : COLLECTIONS.HIRE_RATINGS;

    const ratings = db.collection(collectionName);
    const existing = await ratings
      .where("postId", "==", postId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (existing.empty) {
      await ratings.add({ postId, userId, rating });
    } else {
      await existing.docs[0]!.ref.update({ rating });
    }

    return reply.send({ postId, userId, rating });
  });
}
