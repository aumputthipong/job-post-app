import "dotenv/config";
import Fastify from "fastify";
import { favoritesRoutes } from "./routes/favorites.js";
import { ratingsRoutes } from "./routes/ratings.js";

const app = Fastify({
  logger: {
    transport: { target: "pino-pretty" },
  },
});

app.get("/health", async () => ({ ok: true }));

await app.register(favoritesRoutes);
await app.register(ratingsRoutes);

// --- Next up per the migration plan (Phase 2), not yet implemented: ---
// POST/PUT/DELETE /posts/find   (JobPosts, + delete image from Storage)
// POST/PUT/DELETE /posts/hire   (HirePosts, + delete resume from Storage)
// POST            /comments     (JobComments / HireComments)
// PUT             /users/me     (User Info)
// PUT             /users/me/noti-preferences (User Noti)
// POST            /auth/register (createUser + User Info doc in one transaction)

const port = Number(process.env.PORT ?? 4000);

app
  .listen({ port, host: "0.0.0.0" })
  .then(() => app.log.info(`API listening on http://localhost:${port}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
