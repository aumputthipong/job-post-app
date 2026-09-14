import type { FastifyInstance } from "fastify";
import { COLLECTIONS } from "@jobapp-platform/shared";
import { db } from "../firebaseAdmin.js";
import { requireAuth } from "../plugins/auth.js";

/**
 * Notifications are read by the app straight from Firestore (rules allow a user
 * their own rows); marking them read is the only write, and it goes through here.
 */
export async function notificationsRoutes(app: FastifyInstance) {
  app.post("/notifications/:id/read", { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const ref = db.collection(COLLECTIONS.NOTIFICATIONS).doc(id);
    const snap = await ref.get();

    // Someone else's row answers like a missing one, so ids can't be probed.
    if (!snap.exists || snap.data()!.userId !== request.userId) {
      return reply.code(404).send({ error: "ไม่พบการแจ้งเตือนนี้" });
    }
    if (!snap.data()!.read) await ref.update({ read: true });
    return reply.send({ id, read: true });
  });

  app.post("/notifications/read-all", { preHandler: requireAuth }, async (request, reply) => {
    const unread = await db
      .collection(COLLECTIONS.NOTIFICATIONS)
      .where("userId", "==", request.userId!)
      .where("read", "==", false)
      .get();

    for (let i = 0; i < unread.docs.length; i += 400) {
      const batch = db.batch();
      unread.docs.slice(i, i + 400).forEach((doc) => batch.update(doc.ref, { read: true }));
      await batch.commit();
    }
    return reply.send({ updated: unread.size });
  });
}
