import { COLLECTIONS, type Media } from "@jobapp-platform/shared";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { buildApp } from "../src/app.js";
import { db } from "../src/firebaseAdmin.js";
import { deleteImage } from "../src/lib/cloudinary.js";
import { bearer, createUser, hirePost, jobPost, resetEmulators, type TestUser, uploaded } from "./helpers.js";

// Records which files the API deletes, instead of calling Cloudinary.
vi.mock("../src/lib/cloudinary.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../src/lib/cloudinary.js")>()),
  deleteImage: vi.fn(async () => true),
}));

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

beforeEach(async () => {
  vi.mocked(deleteImage).mockClear();
  await resetEmulators();
});

const deleted = () => vi.mocked(deleteImage).mock.calls.map(([publicId]) => publicId);

async function createJob(user: TestUser, images: Media[]) {
  const res = await app.inject({ method: "POST", url: "/posts/find", headers: bearer(user), payload: jobPost({ images }) });
  expect(res.statusCode).toBe(201);
  return res.json<{ id: string }>().id;
}

const readJob = async (id: string) => (await db.collection(COLLECTIONS.JOB_POSTS).doc(id).get()).data()!;

describe("post images", () => {
  it("stores several images in order", async () => {
    const author = await createUser();
    const images = ["a", "b", "c"].map((name) => uploaded(author, "posts", name));

    const id = await createJob(author, images);

    expect((await readJob(id)).images).toEqual(images);
  });

  it("refuses more than 10 images, in Thai", async () => {
    const author = await createUser();
    const images = Array.from({ length: 11 }, (_, i) => uploaded(author, "posts", `p${i}`));

    const res = await app.inject({ method: "POST", url: "/posts/hire", headers: bearer(author), payload: hirePost({ images }) });

    expect(res.statusCode).toBe(400);
    expect(res.json().error.fieldErrors.images).toContain("เพิ่มรูปได้สูงสุด 10 รูป");
  });

  it("refuses an image another user uploaded", async () => {
    const author = await createUser("author");
    const other = await createUser("other");

    const res = await app.inject({
      method: "POST",
      url: "/posts/find",
      headers: bearer(author),
      payload: jobPost({ images: [uploaded(other, "posts", "theirs")] }),
    });

    expect(res.statusCode).toBe(403);
  });

  it("deletes only the images an edit drops", async () => {
    const author = await createUser();
    const [a, b, c] = ["a", "b", "c"].map((name) => uploaded(author, "posts", name));
    const d = uploaded(author, "posts", "d");
    const id = await createJob(author, [a, b, c]);

    const res = await app.inject({
      method: "PUT",
      url: `/posts/find/${id}`,
      headers: bearer(author),
      payload: { images: [c, a, d] },
    });

    expect(res.statusCode).toBe(200);
    expect((await readJob(id)).images).toEqual([c, a, d]);
    expect(deleted()).toEqual([b!.publicId]);
  });

  it("keeps the stored publicId for an image already on the post", async () => {
    // Otherwise an edit could relabel a kept image with someone else's file,
    // and the next edit that drops it would delete that file.
    const author = await createUser("author");
    const victim = await createUser("victim");
    const mine = uploaded(author, "posts", "mine");
    const id = await createJob(author, [mine]);

    await app.inject({
      method: "PUT",
      url: `/posts/find/${id}`,
      headers: bearer(author),
      payload: { images: [{ url: mine.url, publicId: uploaded(victim, "posts", "precious").publicId }] },
    });
    await app.inject({ method: "PUT", url: `/posts/find/${id}`, headers: bearer(author), payload: { images: [] } });

    expect(deleted()).toEqual([mine.publicId]);
  });

  it("leaves images alone when an edit doesn't send the list", async () => {
    const author = await createUser();
    const image = uploaded(author, "posts", "a");
    const id = await createJob(author, [image]);

    await app.inject({ method: "PUT", url: `/posts/find/${id}`, headers: bearer(author), payload: { wage: "1" } });

    expect((await readJob(id)).images).toEqual([image]);
    expect(deleted()).toEqual([]);
  });

  it("turns an old single-image post into a list on edit, keeping that image", async () => {
    const author = await createUser();
    const ref = await db.collection(COLLECTIONS.HIRE_POSTS).add({
      ...hirePost(),
      postById: author.uid,
      resumeUrl: "https://example.test/old.png",
      resumePublicId: "jobapp/posts/old",
    });
    const added = uploaded(author, "posts", "new");

    const res = await app.inject({
      method: "PUT",
      url: `/posts/hire/${ref.id}`,
      headers: bearer(author),
      payload: { images: [{ url: "https://example.test/old.png" }, added] },
    });

    expect(res.statusCode).toBe(200);
    const doc = (await ref.get()).data()!;
    expect(doc.images).toEqual([{ url: "https://example.test/old.png", publicId: "jobapp/posts/old" }, added]);
    expect(doc.resumeUrl).toBeUndefined();
    expect(doc.resumePublicId).toBeUndefined();
    expect(deleted()).toEqual([]);
  });

  it("deletes every image with the post, old single image included", async () => {
    const author = await createUser();
    const images = ["a", "b"].map((name) => uploaded(author, "posts", name));
    const id = await createJob(author, images);
    const legacy = await db.collection(COLLECTIONS.JOB_POSTS).add({
      ...jobPost(),
      postById: author.uid,
      imageUrl: "https://example.test/old.png",
      imagePublicId: "jobapp/posts/old",
    });

    await app.inject({ method: "DELETE", url: `/posts/find/${id}`, headers: bearer(author) });
    await app.inject({ method: "DELETE", url: `/posts/find/${legacy.id}`, headers: bearer(author) });

    expect(deleted()).toEqual([images[0]!.publicId, images[1]!.publicId, "jobapp/posts/old"]);
  });
});
