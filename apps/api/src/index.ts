import "dotenv/config";
import { buildApp } from "./app.js";
import { usingEmulators } from "./firebaseAdmin.js";
import { cloudinaryConfigured } from "./lib/cloudinary.js";

const app = await buildApp({
  logger: {
    transport: { target: "pino-pretty" },
  },
});

const port = Number(process.env.PORT ?? 4000);

app
  .listen({ port, host: "0.0.0.0" })
  .then(() => {
    app.log.info(`API listening on http://localhost:${port}`);
    app.log.info(
      usingEmulators
        ? "Using the local Firebase emulators"
        : "Using the PRODUCTION Firebase project",
    );
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
