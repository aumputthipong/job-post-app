import { COLLECTIONS, notificationId } from "@jobapp-platform/shared";
import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { db } from "../src/firebaseAdmin.js";
import { bearer, createUser, hirePost, jobPost, resetEmulators, type TestUser } from "./helpers.js";

let app: FastifyInstance;

// A fresh app per test: the rate limiter counts in memory.
beforeEach(async () => {
  await resetEmulators();
  app = await buildApp();
  await app.ready();
});

afterEach(async () => {
  await app.close();
});

async function createJob(user: TestUser, overrides = {}) {
  const res = await app.inject({ method: "POST", url: "/posts/find", headers: bearer(user), payload: jobPost(overrides) });
  expect(res.statusCode).toBe(201);
  return res.json<{ id: string }>().id;
}

const comment = (user: TestUser, postId: string, text = "hi") =>
  app.inject({ method: "POST", url: "/comments/find", headers: bearer(user), payload: { postId, comment: text } });

const rate = (user: TestUser, postId: string, rating: number) =>
  app.inject({ method: "PUT", url: "/ratings", headers: bearer(user), payload: { postKind: "find", postId, rating } });

const follow = (user: TestUser, category: string[]) =>
  app.inject({ method: "PUT", url: "/users/me/noti-preferences", headers: bearer(user), payload: { category } });

const rowsFor = async (user: TestUser) =>
  (await db.collection(COLLECTIONS.NOTIFICATIONS).where("userId", "==", user.uid).get()).docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Array<Record<string, any>>;

const row = async (user: TestUser, type: "comment" | "rating" | "new_post", postId: string) =>
  (await db.collection(COLLECTIONS.NOTIFICATIONS).doc(notificationId(user.uid, type, postId)).get()).data();

describe("comment notifications", () => {
  it("tells the post's owner, with the post's title", async () => {
    const owner = await createUser("owner");
    const fan = await createUser("fan");
    const postId = await createJob(owner, { jobTitle: "Barista" });

    await comment(fan, postId);

    expect(await row(owner, "comment", postId)).toMatchObject({
      userId: owner.uid,
      type: "comment",
      postKind: "find",
      postId,
      postTitle: "Barista",
      actorIds: [fan.uid],
      actorCount: 1,
      read: false,
    });
  });

  it("doesn't tell owners about their own comments", async () => {
    const owner = await createUser();
    const postId = await createJob(owner);

    await comment(owner, postId);

    expect(await rowsFor(owner)).toEqual([]);
  });

  it("groups many comments on one post into one row, counting people, not comments", async () => {
    const owner = await createUser("owner");
    const [a, b] = [await createUser("a"), await createUser("b")];
    const postId = await createJob(owner);

    await comment(a, postId, "1");
    await comment(b, postId, "2");
    await comment(a, postId, "3");

    const rows = await rowsFor(owner);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ actorIds: [a.uid, b.uid], actorCount: 2, read: false });
  });

  it("starts the count over once the owner has read it", async () => {
    const owner = await createUser("owner");
    const [a, b] = [await createUser("a"), await createUser("b")];
    const postId = await createJob(owner);
    await comment(a, postId);
    await comment(b, postId);

    await app.inject({
      method: "POST",
      url: `/notifications/${notificationId(owner.uid, "comment", postId)}/read`,
      headers: bearer(owner),
    });
    await comment(a, postId);

    expect(await row(owner, "comment", postId)).toMatchObject({ actorIds: [a.uid], actorCount: 1, read: false });
  });
});

describe("rating notifications", () => {
  it("counts a person once, however often they change their stars", async () => {
    const owner = await createUser("owner");
    const rater = await createUser("rater");
    const postId = await createJob(owner);

    for (const stars of [1, 3, 5, 4]) await rate(rater, postId, stars);

    expect(await rowsFor(owner)).toHaveLength(1);
    expect(await row(owner, "rating", postId)).toMatchObject({ actorIds: [rater.uid], actorCount: 1 });
  });

  it("refuses a rating for a post that doesn't exist", async () => {
    const rater = await createUser();
    const res = await rate(rater, "missing", 5);
    expect(res.statusCode).toBe(404);
  });
});

describe("new post notifications", () => {
  it("tells followers of the category, not the author or anyone else", async () => {
    const author = await createUser("author");
    const follower = await createUser("follower");
    const other = await createUser("other");
    await follow(follower, ["งานไอที", "งานบัญชี"]);
    await follow(other, ["งานอาหาร"]);
    await follow(author, ["งานไอที"]);

    const postId = await createJob(author, { category: "งานไอที", jobTitle: "Dev" });

    expect(await row(follower, "new_post", postId)).toMatchObject({ postTitle: "Dev", actorIds: [author.uid] });
    expect(await rowsFor(other)).toEqual([]);
    expect(await rowsFor(author)).toEqual([]);
  });

  it("works for freelance posts too", async () => {
    const author = await createUser("author");
    const follower = await createUser("follower");
    await follow(follower, ["งานออกแบบ"]);

    const res = await app.inject({ method: "POST", url: "/posts/hire", headers: bearer(author), payload: hirePost() });

    expect(await row(follower, "new_post", res.json().id)).toMatchObject({ postKind: "hire", postTitle: "Freelance designer" });
  });
});

describe("marking read", () => {
  it("marks one row, and only the caller's own", async () => {
    const owner = await createUser("owner");
    const fan = await createUser("fan");
    const postId = await createJob(owner);
    await comment(fan, postId);
    const id = notificationId(owner.uid, "comment", postId);

    const intruder = await app.inject({ method: "POST", url: `/notifications/${id}/read`, headers: bearer(fan) });
    expect(intruder.statusCode).toBe(404);
    expect((await row(owner, "comment", postId))?.read).toBe(false);

    const res = await app.inject({ method: "POST", url: `/notifications/${id}/read`, headers: bearer(owner) });
    expect(res.statusCode).toBe(200);
    expect((await row(owner, "comment", postId))?.read).toBe(true);
  });

  it("marks all of the caller's rows and nobody else's", async () => {
    const owner = await createUser("owner");
    const fan = await createUser("fan");
    const [p1, p2] = [await createJob(owner), await createJob(owner)];
    const fanPost = await createJob(fan);
    await comment(fan, p1);
    await rate(fan, p2, 5);
    await comment(owner, fanPost);

    const res = await app.inject({ method: "POST", url: "/notifications/read-all", headers: bearer(owner) });

    expect(res.json().updated).toBe(2);
    expect((await rowsFor(owner)).every((r) => r.read)).toBe(true);
    expect((await rowsFor(fan)).every((r) => !r.read)).toBe(true);
  });
});

it("deleting a post deletes the notifications about it", async () => {
  const owner = await createUser("owner");
  const fan = await createUser("fan");
  await follow(fan, ["งานไอที"]);
  const postId = await createJob(owner, { category: "งานไอที" });
  await comment(fan, postId);
  expect(await rowsFor(fan)).toHaveLength(1);
  expect(await rowsFor(owner)).toHaveLength(1);

  await app.inject({ method: "DELETE", url: `/posts/find/${postId}`, headers: bearer(owner) });

  expect(await rowsFor(fan)).toEqual([]);
  expect(await rowsFor(owner)).toEqual([]);
});

describe("rate limits", () => {
  it("stops a burst of comments with a Thai 429", async () => {
    const owner = await createUser("owner");
    const spammer = await createUser("spammer");
    const postId = await createJob(owner);

    const codes: number[] = [];
    for (let i = 0; i < 12; i += 1) codes.push((await comment(spammer, postId, `c${i}`)).statusCode);

    expect(codes.slice(0, 10).every((c) => c === 201)).toBe(true);
    const blocked = await comment(spammer, postId, "again");
    expect(blocked.statusCode).toBe(429);
    expect(blocked.json().error).toContain("ถี่เกินไป");
    expect(blocked.headers["retry-after"]).toBeDefined();
  });

  it("counts each user separately", async () => {
    const owner = await createUser("owner");
    const spammer = await createUser("spammer");
    const polite = await createUser("polite");
    const postId = await createJob(owner);
    for (let i = 0; i < 10; i += 1) await comment(spammer, postId);

    expect((await comment(polite, postId)).statusCode).toBe(201);
  });

  it("limits new posts to 5 a minute", async () => {
    const author = await createUser();
    for (let i = 0; i < 5; i += 1) await createJob(author);
    const sixth = await app.inject({ method: "POST", url: "/posts/find", headers: bearer(author), payload: jobPost() });
    expect(sixth.statusCode).toBe(429);
  });
});
