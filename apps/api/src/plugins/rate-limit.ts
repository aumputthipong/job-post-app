import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * Per-user limit on write routes, so tapping a button repeatedly can't flood
 * other users with notifications. Runs after requireAuth and counts by user id.
 *
 * In memory: the API is a single local process (nothing is deployed), so there
 * is no second instance to share counts with.
 */
export function rateLimit(name: string, max: number, windowMs = 60_000) {
  const hits = new Map<string, number[]>();

  return async function limit(request: FastifyRequest, reply: FastifyReply) {
    const key = request.userId!;
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);

    if (recent.length >= max) {
      const retryAfter = Math.ceil((recent[0]! + windowMs - now) / 1000);
      request.log.warn({ name, userId: key }, "rate limited");
      return reply
        .code(429)
        .header("retry-after", retryAfter)
        .send({ error: "ทำรายการถี่เกินไป กรุณารอสักครู่แล้วลองใหม่" });
    }

    recent.push(now);
    hits.set(key, recent);
  };
}
