import "dotenv/config";
import multipart from "@fastify/multipart";
import Fastify from "fastify";
import { cloudinaryConfigured } from "./lib/cloudinary.js";
import { authRoutes } from "./routes/auth.js";
import { commentsRoutes } from "./routes/comments.js";
import { favoritesRoutes } from "./routes/favorites.js";
import { postsRoutes } from "./routes/posts.js";
import { ratingsRoutes } from "./routes/ratings.js";
import { uploadsRoutes } from "./routes/uploads.js";
import { usersRoutes } from "./routes/users.js";

const app = Fastify({
  logger: {
    transport: { target: "pino-pretty" },
  },
});

await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024, files: 1 } });

app.get("/health", async () => ({
  ok: true,
  cloudinary: cloudinaryConfigured ? "configured" : "missing credentials",
}));

await app.register(authRoutes);
await app.register(commentsRoutes);
await app.register(favoritesRoutes);
await app.register(postsRoutes);
await app.register(ratingsRoutes);
await app.register(uploadsRoutes);
await app.register(usersRoutes);

const port = Number(process.env.PORT ?? 4000);

app
  .listen({ port, host: "0.0.0.0" })
  .then(() => {
    app.log.info(`API listening on http://localhost:${port}`);
    if (!cloudinaryConfigured) {
      app.log.warn(
        "Cloudinary credentials missing — /uploads will fail. Add CLOUDINARY_* to apps/api/.env",
      );
    }
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
