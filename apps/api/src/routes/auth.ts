import type { FastifyInstance } from "fastify";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { COLLECTIONS } from "@jobapp-platform/shared";
import { auth, db } from "../firebaseAdmin.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

/**
 * Replaces RegisterScreen.js, which called createUserWithEmailAndPassword and
 * then wrote the "User Info" document as two independent operations. If the
 * second one failed the account still existed but had no profile, and the app
 * has no way to recover from that state — the user could log in to a broken
 * session forever.
 *
 * Here the profile write is what completes registration: if it fails, the auth
 * user is deleted so the address stays free to sign up again.
 *
 * This endpoint is deliberately unauthenticated — there's no token yet.
 */
export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }
    const { email, password, firstName, lastName } = parsed.data;

    let uid: string | undefined;
    try {
      const user = await auth.createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
      });
      uid = user.uid;

      await db.collection(COLLECTIONS.USER_INFO).doc(uid).set({
        email,
        firstName,
        lastName,
        job: "",
        aboutme: "",
        phone: "",
        line: "",
        facebook: "",
        bachelor: "",
        master: "",
        doctoral: "",
        createdAt: FieldValue.serverTimestamp(),
      });

      return reply.code(201).send({ uid });
    } catch (err: any) {
      if (uid) {
        // The account was created but the profile wasn't — roll it back so the
        // caller can retry cleanly instead of being stuck half-registered.
        await auth.deleteUser(uid).catch((cleanupErr) => {
          request.log.error({ cleanupErr, uid }, "failed to roll back auth user");
        });
      }

      if (err?.code === "auth/email-already-exists") {
        return reply.code(409).send({ error: "That email is already registered" });
      }

      request.log.error({ err }, "registration failed");
      return reply.code(500).send({ error: "Registration failed" });
    }
  });
}
