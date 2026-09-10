import type { FastifyReply, FastifyRequest } from "fastify";
import { auth } from "../firebaseAdmin.js";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }
}

/**
 * Verifies the "Authorization: Bearer <Firebase ID token>" header the
 * mobile app must send (obtained client-side via
 * `firebase.auth().currentUser.getIdToken()`, same auth session it
 * already has — no separate login is needed for the API).
 *
 * On success, sets request.userId to the verified Firebase uid. Route
 * handlers must use THIS uid for postById/userId fields — never trust a
 * userId sent in the request body, that's what let any client write
 * favorites/ratings/posts as anyone in the legacy direct-to-Firestore code.
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    return reply.code(401).send({ error: "Missing Authorization: Bearer <idToken> header" });
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    request.userId = decoded.uid;
  } catch (err) {
    request.log.warn({ err }, "ID token verification failed");
    return reply.code(401).send({ error: "Invalid or expired ID token" });
  }
}
