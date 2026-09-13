import multipart from "@fastify/multipart";
import Fastify, { type FastifyServerOptions } from "fastify";
import { usingEmulators } from "./firebaseAdmin.js";
import { cloudinaryConfigured } from "./lib/cloudinary.js";
import { authRoutes } from "./routes/auth.js";
import { commentsRoutes } from "./routes/comments.js";
import { favoritesRoutes } from "./routes/favorites.js";
import { notificationsRoutes } from "./routes/notifications.js";
import { postsRoutes } from "./routes/posts.js";
import { ratingsRoutes } from "./routes/ratings.js";
import { uploadsRoutes } from "./routes/uploads.js";
import { usersRoutes } from "./routes/users.js";

/**
 * Builds the server without starting it, so tests can drive it with
 * `app.inject()` instead of opening a real port.
 */
export async function buildApp(options: FastifyServerOptions = {}) {
  const app = Fastify(options);

  await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024, files: 1 } });

  app.get("/health", async () => ({
    ok: true,
    firebase: usingEmulators ? "emulators" : "production",
    cloudinary: cloudinaryConfigured ? "configured" : "missing credentials",
  }));

  await app.register(authRoutes);
  await app.register(commentsRoutes);
  await app.register(favoritesRoutes);
  await app.register(notificationsRoutes);
  await app.register(postsRoutes);
  await app.register(ratingsRoutes);
  await app.register(uploadsRoutes);
  await app.register(usersRoutes);

  return app;
}
