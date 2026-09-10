import type { FastifyInstance } from "fastify";
import { COLLECTIONS, toggleFavoriteSchema } from "@jobapp-platform/shared";
import { db } from "../firebaseAdmin.js";
import { requireAuth } from "../plugins/auth.js";

export async function favoritesRoutes(app: FastifyInstance) {
  // Replaces the TOGGLE_FAVORITE side-effect that used to live inside
  // jobsReducer.js/hireReducer.js. postKind picks JobPosts vs HirePosts
  // favorites — the legacy app stored both in one FavoriteJobs collection
  // with no field telling them apart, which is preserved here as-is.
  app.post("/favorites/toggle", { preHandler: requireAuth }, async (request, reply) => {
    const parsed = toggleFavoriteSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }
    const { postId } = parsed.data;
    const userId = request.userId!;

    const favorites = db.collection(COLLECTIONS.FAVORITE_JOBS);
    const existing = await favorites
      .where("postId", "==", postId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (existing.empty) {
      await favorites.add({ postId, userId });
      return reply.send({ favorited: true });
    }

    await Promise.all(existing.docs.map((doc) => doc.ref.delete()));
    return reply.send({ favorited: false });
  });
}
