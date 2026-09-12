import { COLLECTIONS } from "@jobapp-platform/shared";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { auth, db } from "../src/firebaseAdmin.js";
import { bearer, createUser, hirePost, jobPost, resetEmulators, type TestUser } from "./helpers.js";

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

beforeEach(resetEmulators);

async function createJob(user: TestUser, overrides = {}) {
  const res = await app.inject({
    method: "POST",
    url: "/posts/find",
    headers: bearer(user),
    payload: jobPost(overrides),
  });
  expect(res.statusCode).toBe(201);
  return res.json<{ id: string }>().id;
}

async function countWhere(collection: string, field: string, value: string) {
  const snap = await db.collection(collection).where(field, "==", value).get();
  return snap.size;
}

describe("authentication", () => {
  const protectedRoutes = [
    ["POST", "/posts/find"],
    ["PUT", "/posts/find/x"],
    ["DELETE", "/posts/hire/x"],
    ["POST", "/comments/find"],
    ["PUT", "/ratings"],
    ["POST", "/favorites/toggle"],
    ["GET", "/users/me"],
    ["PUT", "/users/me/noti-preferences"],
    ["POST", "/uploads"],
  ] as const;

  it.each(protectedRoutes)("%s %s rejects a request with no token", async (method, url) => {
    const res = await app.inject({ method, url });
    expect(res.statusCode).toBe(401);
  });

  it("rejects a token that isn't a real ID token", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/users/me",
      headers: { authorization: "Bearer not-a-token" },
    });
    expect(res.statusCode).toBe(401);
  });

  it("says so in Thai, since the app shows the message as it comes", async () => {
    const missing = await app.inject({ method: "GET", url: "/users/me" });
    const invalid = await app.inject({
      method: "GET",
      url: "/users/me",
      headers: { authorization: "Bearer not-a-token" },
    });

    expect(missing.json().error).toContain("เข้าสู่ระบบ");
    expect(invalid.json().error).toContain("เข้าสู่ระบบใหม่");
  });
});

describe("posts", () => {
  it("records the author from the token, ignoring a postById in the body", async () => {
    const author = await createUser("author");

    const res = await app.inject({
      method: "POST",
      url: "/posts/find",
      headers: bearer(author),
      payload: { ...jobPost(), postById: "someone-else" },
    });

    expect(res.statusCode).toBe(201);
    const doc = await db.collection(COLLECTIONS.JOB_POSTS).doc(res.json().id).get();
    expect(doc.data()?.postById).toBe(author.uid);
  });

  it("creates a post without an image", async () => {
    // The legacy screens silently refused to post without one.
    const author = await createUser();
    const id = await createJob(author);
    const doc = await db.collection(COLLECTIONS.JOB_POSTS).doc(id).get();
    expect(doc.exists).toBe(true);
    expect(doc.data()?.imageUrl).toBeUndefined();
  });

  it("rejects an invalid body", async () => {
    const author = await createUser();
    const res = await app.inject({
      method: "POST",
      url: "/posts/hire",
      headers: bearer(author),
      payload: { ...hirePost(), email: "not-an-email" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects a whitespace-only title with the form's Thai message", async () => {
    const author = await createUser();
    const res = await app.inject({
      method: "POST",
      url: "/posts/find",
      headers: bearer(author),
      payload: { ...jobPost(), jobTitle: "   " },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.fieldErrors.jobTitle).toContain("กรุณากรอกหัวข้องาน");
  });

  it("won't let another user edit or delete a post", async () => {
    const author = await createUser("author");
    const intruder = await createUser("intruder");
    const id = await createJob(author, { jobTitle: "Original" });

    const edit = await app.inject({
      method: "PUT",
      url: `/posts/find/${id}`,
      headers: bearer(intruder),
      payload: { jobTitle: "Hijacked" },
    });
    const remove = await app.inject({
      method: "DELETE",
      url: `/posts/find/${id}`,
      headers: bearer(intruder),
    });

    expect(edit.statusCode).toBe(403);
    expect(remove.statusCode).toBe(403);
    const doc = await db.collection(COLLECTIONS.JOB_POSTS).doc(id).get();
    expect(doc.data()?.jobTitle).toBe("Original");
  });

  it("lets the author edit their own post", async () => {
    const author = await createUser();
    const id = await createJob(author);

    const res = await app.inject({
      method: "PUT",
      url: `/posts/find/${id}`,
      headers: bearer(author),
      payload: { wage: "45000" },
    });

    expect(res.statusCode).toBe(200);
    const doc = await db.collection(COLLECTIONS.JOB_POSTS).doc(id).get();
    expect(doc.data()?.wage).toBe("45000");
  });

  it("deletes a post with more dependents than one write batch holds", async () => {
    // A batch takes 500 operations; the route has to split the work up.
    const author = await createUser("author");
    const id = await createJob(author);

    const comments = db.collection(COLLECTIONS.JOB_COMMENTS);
    for (let written = 0; written < 600; written += 200) {
      const batch = db.batch();
      for (let i = 0; i < 200; i += 1) {
        batch.set(comments.doc(), { postId: id, userId: author.uid, comment: `c${written + i}` });
      }
      await batch.commit();
    }
    expect(await countWhere(COLLECTIONS.JOB_COMMENTS, "postId", id)).toBe(600);

    const res = await app.inject({ method: "DELETE", url: `/posts/find/${id}`, headers: bearer(author) });

    expect(res.statusCode).toBe(200);
    expect(await countWhere(COLLECTIONS.JOB_COMMENTS, "postId", id)).toBe(0);
  });

  it("deleting a post also removes its comments, ratings and favourites", async () => {
    // The legacy client deleted only the post document and left these behind.
    const author = await createUser("author");
    const fan = await createUser("fan");
    const id = await createJob(author);

    await app.inject({ method: "POST", url: "/comments/find", headers: bearer(fan), payload: { postId: id, comment: "Nice" } });
    await app.inject({ method: "PUT", url: "/ratings", headers: bearer(fan), payload: { postKind: "find", postId: id, rating: 5 } });
    await app.inject({ method: "POST", url: "/favorites/toggle", headers: bearer(fan), payload: { postKind: "find", postId: id } });

    expect(await countWhere(COLLECTIONS.JOB_COMMENTS, "postId", id)).toBe(1);

    const res = await app.inject({ method: "DELETE", url: `/posts/find/${id}`, headers: bearer(author) });

    expect(res.statusCode).toBe(200);
    expect((await db.collection(COLLECTIONS.JOB_POSTS).doc(id).get()).exists).toBe(false);
    expect(await countWhere(COLLECTIONS.JOB_COMMENTS, "postId", id)).toBe(0);
    expect(await countWhere(COLLECTIONS.JOB_RATINGS, "postId", id)).toBe(0);
    expect(await countWhere(COLLECTIONS.FAVORITE_JOBS, "postId", id)).toBe(0);
  });
});

describe("ratings", () => {
  it("keeps one rating per user per post, updating it in place", async () => {
    const author = await createUser();
    const rater = await createUser("rater");
    const id = await createJob(author);

    for (const rating of [2, 5]) {
      const res = await app.inject({
        method: "PUT",
        url: "/ratings",
        headers: bearer(rater),
        payload: { postKind: "find", postId: id, rating },
      });
      expect(res.statusCode).toBe(200);
    }

    const snap = await db.collection(COLLECTIONS.JOB_RATINGS).where("postId", "==", id).get();
    expect(snap.size).toBe(1);
    expect(snap.docs[0]!.data()).toMatchObject({ userId: rater.uid, rating: 5 });
  });

  it("writes find-job ratings to JobRatings, not the old RatingJobs name", async () => {
    const author = await createUser();
    const id = await createJob(author);
    await app.inject({ method: "PUT", url: "/ratings", headers: bearer(author), payload: { postKind: "find", postId: id, rating: 4 } });

    expect(await countWhere(COLLECTIONS.JOB_RATINGS, "postId", id)).toBe(1);
    expect(await countWhere("RatingJobs", "postId", id)).toBe(0);
  });

  it("rejects a rating outside 1–5", async () => {
    const user = await createUser();
    const res = await app.inject({
      method: "PUT",
      url: "/ratings",
      headers: bearer(user),
      payload: { postKind: "find", postId: "x", rating: 9 },
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("favourites", () => {
  it("toggles on, then off", async () => {
    const user = await createUser();
    const payload = { postKind: "find", postId: "post-1" };

    const first = await app.inject({ method: "POST", url: "/favorites/toggle", headers: bearer(user), payload });
    const second = await app.inject({ method: "POST", url: "/favorites/toggle", headers: bearer(user), payload });

    expect(first.json()).toEqual({ favorited: true });
    expect(second.json()).toEqual({ favorited: false });
    expect(await countWhere(COLLECTIONS.FAVORITE_JOBS, "userId", user.uid)).toBe(0);
  });
});

describe("comments", () => {
  it("refuses a comment on a post that doesn't exist", async () => {
    const user = await createUser();
    const res = await app.inject({
      method: "POST",
      url: "/comments/find",
      headers: bearer(user),
      payload: { postId: "missing", comment: "Hello" },
    });
    expect(res.statusCode).toBe(404);
  });

  it("only lets the author delete a comment", async () => {
    const author = await createUser("author");
    const commenter = await createUser("commenter");
    const other = await createUser("other");
    const postId = await createJob(author);

    const created = await app.inject({
      method: "POST",
      url: "/comments/find",
      headers: bearer(commenter),
      payload: { postId, comment: "Hello" },
    });
    const commentId = created.json().id;

    const byOther = await app.inject({ method: "DELETE", url: `/comments/find/${commentId}`, headers: bearer(other) });
    const byAuthor = await app.inject({ method: "DELETE", url: `/comments/find/${commentId}`, headers: bearer(commenter) });

    expect(byOther.statusCode).toBe(403);
    expect(byAuthor.statusCode).toBe(200);
  });
});

describe("users", () => {
  it("keeps a single notification-preferences row per user", async () => {
    // The legacy reducer created a new row on every save.
    const user = await createUser();

    for (const category of [["งานไอที"], ["งานบัญชี", "งานออกแบบ"]]) {
      const res = await app.inject({
        method: "PUT",
        url: "/users/me/noti-preferences",
        headers: bearer(user),
        payload: { category },
      });
      expect(res.statusCode).toBe(200);
    }

    const snap = await db.collection(COLLECTIONS.USER_NOTI).where("notiBy", "==", user.uid).get();
    expect(snap.size).toBe(1);
    expect(snap.docs[0]!.data().category).toEqual(["งานบัญชี", "งานออกแบบ"]);
  });

  it("saves the avatar as imageUrl, the field every screen reads", async () => {
    const user = await createUser();
    await db.collection(COLLECTIONS.USER_INFO).doc(user.uid).set({ email: user.email, firstName: "A" });

    const res = await app.inject({
      method: "PUT",
      url: "/users/me",
      headers: bearer(user),
      payload: { imageUrl: "https://example.test/avatar.png" },
    });

    expect(res.statusCode).toBe(200);
    const doc = await db.collection(COLLECTIONS.USER_INFO).doc(user.uid).get();
    expect(doc.data()?.imageUrl).toBe("https://example.test/avatar.png");
  });

  it("returns 404 for a user with no profile document", async () => {
    const user = await createUser();
    const res = await app.inject({ method: "GET", url: "/users/me", headers: bearer(user) });
    expect(res.statusCode).toBe(404);
  });

  it("refuses to blank out a name, in the form's Thai", async () => {
    const user = await createUser();
    const res = await app.inject({
      method: "PUT",
      url: "/users/me",
      headers: bearer(user),
      payload: { firstName: " " },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.fieldErrors.firstName).toContain("กรุณากรอกชื่อ");
  });
});

describe("registration", () => {
  const body = {
    email: "new-person@example.test",
    password: "password123",
    firstName: "New",
    lastName: "Person",
  };

  it("creates the account and its profile together", async () => {
    const res = await app.inject({ method: "POST", url: "/auth/register", payload: body });

    expect(res.statusCode).toBe(201);
    const { uid } = res.json<{ uid: string }>();
    const profile = await db.collection(COLLECTIONS.USER_INFO).doc(uid).get();
    expect(profile.data()).toMatchObject({ email: body.email, firstName: "New", lastName: "Person" });
    expect((await auth.getUser(uid)).email).toBe(body.email);
  });

  it("answers 409 for an email that's already registered", async () => {
    await app.inject({ method: "POST", url: "/auth/register", payload: body });
    const again = await app.inject({ method: "POST", url: "/auth/register", payload: body });
    expect(again.statusCode).toBe(409);
  });

  it("rejects an invalid body without creating anything", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: { email: "bad", password: "1" },
    });
    expect(res.statusCode).toBe(400);
    // Same schema (and Thai messages) the app validates its form with.
    expect(res.json().error.fieldErrors.email).toContain("กรุณากรอกอีเมลให้ถูกต้อง");
    const users = await auth.listUsers();
    expect(users.users).toHaveLength(0);
  });
});
