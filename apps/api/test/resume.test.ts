import { COLLECTIONS } from "@jobapp-platform/shared";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { buildApp } from "../src/app.js";
import { db } from "../src/firebaseAdmin.js";
import { deleteImage, uploadImage } from "../src/lib/cloudinary.js";
import { bearer, createUser, resetEmulators, type TestUser } from "./helpers.js";

vi.mock("../src/lib/cloudinary.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../src/lib/cloudinary.js")>()),
  deleteImage: vi.fn(async () => true),
  uploadImage: vi.fn(async (_buffer: Buffer, folder: string) => ({
    url: `https://res.cloudinary.com/demo/image/upload/v1/${folder}/file.pdf`,
    publicId: `${folder}/file`,
  })),
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
  vi.mocked(uploadImage).mockClear();
  await resetEmulators();
});

const resumeOf = (user: TestUser, name: string) => {
  const publicId = `jobapp-dev/resumes/${user.uid}/${name}`;
  return { url: `https://res.cloudinary.com/demo/image/upload/v1/${publicId}.pdf`, publicId, name: `${name}.pdf` };
};

async function withProfile(user: TestUser) {
  await db.collection(COLLECTIONS.USER_INFO).doc(user.uid).set({ email: user.email, firstName: "A", lastName: "B" });
  return db.collection(COLLECTIONS.USER_INFO).doc(user.uid);
}

const putMe = (user: TestUser, payload: object) =>
  app.inject({ method: "PUT", url: "/users/me", headers: bearer(user), payload });

function multipart(folder: string, contentType: string) {
  const boundary = "----test";
  const body =
    `--${boundary}\r\nContent-Disposition: form-data; name="folder"\r\n\r\n${folder}\r\n` +
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="cv"\r\nContent-Type: ${contentType}\r\n\r\n%PDF-1.4\r\n` +
    `--${boundary}--\r\n`;
  return { payload: body, headers: { "content-type": `multipart/form-data; boundary=${boundary}` } };
}

describe("résumé", () => {
  it("accepts a PDF upload for a résumé, into the user's own folder", async () => {
    const user = await createUser();
    const { payload, headers } = multipart("resumes", "application/pdf");

    const res = await app.inject({ method: "POST", url: "/uploads", headers: { ...headers, ...bearer(user) }, payload });

    expect(res.statusCode).toBe(200);
    const [, folder, asPdf] = vi.mocked(uploadImage).mock.calls[0]!;
    expect(folder).toBe(`jobapp-dev/resumes/${user.uid}`);
    // Uploaded as a raw file: as an image, Cloudinary's free plan refuses to rasterise it.
    expect(asPdf).toBe(true);
  });

  it("answers Cloudinary running out of capacity with a Thai retry message", async () => {
    const user = await createUser();
    vi.mocked(uploadImage).mockRejectedValueOnce(Object.assign(new Error("Slow Down"), { http_code: 429 }));
    const { payload, headers } = multipart("resumes", "application/pdf");

    const res = await app.inject({ method: "POST", url: "/uploads", headers: { ...headers, ...bearer(user) }, payload });

    expect(res.statusCode).toBe(503);
    expect(res.json().error).toContain("ลองใหม่");
  });

  it("refuses a PDF anywhere but the résumé folder", async () => {
    const user = await createUser();
    const { payload, headers } = multipart("posts", "application/pdf");

    const res = await app.inject({ method: "POST", url: "/uploads", headers: { ...headers, ...bearer(user) }, payload });

    expect(res.statusCode).toBe(415);
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("saves the caller's own résumé", async () => {
    const user = await createUser();
    const ref = await withProfile(user);
    const resume = resumeOf(user, "cv");

    const res = await putMe(user, { resume });

    expect(res.statusCode).toBe(200);
    expect((await ref.get()).data()?.resume).toEqual(resume);
  });

  it("refuses a file another user uploaded", async () => {
    const user = await createUser("user");
    const other = await createUser("other");
    await withProfile(user);

    const res = await putMe(user, { resume: resumeOf(other, "cv") });

    expect(res.statusCode).toBe(403);
  });

  it("deletes the old file when replaced, and the file when removed", async () => {
    const user = await createUser();
    const ref = await withProfile(user);
    const first = resumeOf(user, "first");
    const second = resumeOf(user, "second");

    await putMe(user, { resume: first });
    await putMe(user, { resume: second });
    await putMe(user, { resume: null });

    expect(vi.mocked(deleteImage).mock.calls.map(([id]) => id)).toEqual([first.publicId, second.publicId]);
    expect((await ref.get()).data()?.resume).toBeUndefined();
  });

  it("leaves the résumé alone when a profile edit doesn't mention it", async () => {
    const user = await createUser();
    const ref = await withProfile(user);
    const resume = resumeOf(user, "cv");
    await putMe(user, { resume });

    await putMe(user, { job: "Designer" });

    expect((await ref.get()).data()?.resume).toEqual(resume);
    expect(deleteImage).not.toHaveBeenCalled();
  });
});
