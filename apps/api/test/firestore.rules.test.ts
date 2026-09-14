/**
 * Tests for firestore.rules — the thing that actually protects the data, since
 * the app's API key is public and ships in every install.
 *
 * These drive the Firestore emulator with the client SDK as a signed-in user,
 * an anonymous one, or a different user, exactly the way the app connects.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { COLLECTIONS } from "@jobapp-platform/shared";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import { PROJECT_ID } from "./helpers.js";

let env: RulesTestEnvironment;

beforeAll(async () => {
  const [host, port] = process.env.FIRESTORE_EMULATOR_HOST!.split(":");
  env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(fileURLToPath(new URL("../../../firestore.rules", import.meta.url)), "utf8"),
      host,
      port: Number(port),
    },
  });
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();

  // Seed as an admin would, bypassing the rules under test.
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, COLLECTIONS.JOB_POSTS, "job-1"), { jobTitle: "Dev", postById: "alice" });
    await setDoc(doc(db, COLLECTIONS.USER_INFO, "alice"), { email: "alice@example.test" });
    await setDoc(doc(db, COLLECTIONS.USER_NOTI, "noti-alice"), { notiBy: "alice", category: ["งานไอที"] });
    await setDoc(doc(db, COLLECTIONS.USER_NOTI, "noti-bob"), { notiBy: "bob", category: ["งานบัญชี"] });
    await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, "n-alice"), { userId: "alice", type: "comment", postId: "job-1", read: false });
    await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, "n-bob"), { userId: "bob", type: "comment", postId: "job-1", read: false });
  });
});

const alice = () => env.authenticatedContext("alice").firestore();
const bob = () => env.authenticatedContext("bob").firestore();
const anonymous = () => env.unauthenticatedContext().firestore();

describe("reads", () => {
  const readable = [
    COLLECTIONS.JOB_POSTS,
    COLLECTIONS.HIRE_POSTS,
    COLLECTIONS.FAVORITE_JOBS,
    COLLECTIONS.JOB_COMMENTS,
    COLLECTIONS.HIRE_COMMENTS,
    COLLECTIONS.JOB_RATINGS,
    COLLECTIONS.HIRE_RATINGS,
    COLLECTIONS.USER_INFO,
  ];

  it.each(readable)("a signed-in user can list %s", async (name) => {
    await assertSucceeds(getDocs(collection(alice(), name)));
  });

  it.each(readable)("an anonymous user cannot list %s", async (name) => {
    await assertFails(getDocs(collection(anonymous(), name)));
  });

  it("anyone signed in can read another user's profile", async () => {
    await assertSucceeds(getDoc(doc(bob(), COLLECTIONS.USER_INFO, "alice")));
  });
});

describe("notification preferences are private", () => {
  it("lets a user query their own row with the notiBy filter", async () => {
    const db = alice();
    await assertSucceeds(
      getDocs(query(collection(db, COLLECTIONS.USER_NOTI), where("notiBy", "==", "alice"))),
    );
  });

  it("refuses an unfiltered list, which would expose everyone's settings", async () => {
    await assertFails(getDocs(collection(alice(), COLLECTIONS.USER_NOTI)));
  });

  it("refuses reading someone else's row directly", async () => {
    await assertFails(getDoc(doc(alice(), COLLECTIONS.USER_NOTI, "noti-bob")));
  });

  it("refuses querying for someone else's row", async () => {
    const db = alice();
    await assertFails(
      getDocs(query(collection(db, COLLECTIONS.USER_NOTI), where("notiBy", "==", "bob"))),
    );
  });
});

describe("notifications are private", () => {
  it("lets a user query their own rows", async () => {
    await assertSucceeds(
      getDocs(query(collection(alice(), COLLECTIONS.NOTIFICATIONS), where("userId", "==", "alice"))),
    );
  });

  it("refuses an unfiltered list and someone else's rows", async () => {
    const db = alice();
    await assertFails(getDocs(collection(db, COLLECTIONS.NOTIFICATIONS)));
    await assertFails(getDoc(doc(db, COLLECTIONS.NOTIFICATIONS, "n-bob")));
    await assertFails(getDocs(query(collection(db, COLLECTIONS.NOTIFICATIONS), where("userId", "==", "bob"))));
  });

  it("refuses marking one read from the client; that goes through the API", async () => {
    await assertFails(updateDoc(doc(alice(), COLLECTIONS.NOTIFICATIONS, "n-alice"), { read: true }));
  });
});

describe("clients cannot write anything", () => {
  it("cannot create a post, even as themselves", async () => {
    await assertFails(
      addDoc(collection(alice(), COLLECTIONS.JOB_POSTS), { jobTitle: "x", postById: "alice" }),
    );
  });

  it("cannot edit or delete their own post", async () => {
    const ref = doc(alice(), COLLECTIONS.JOB_POSTS, "job-1");
    await assertFails(updateDoc(ref, { jobTitle: "changed" }));
    await assertFails(deleteDoc(ref));
  });

  it("cannot edit their own profile", async () => {
    await assertFails(updateDoc(doc(alice(), COLLECTIONS.USER_INFO, "alice"), { job: "x" }));
  });

  it("cannot write a favourite, comment or rating", async () => {
    const db = alice();
    await assertFails(addDoc(collection(db, COLLECTIONS.FAVORITE_JOBS), { postId: "job-1", userId: "alice" }));
    await assertFails(addDoc(collection(db, COLLECTIONS.JOB_COMMENTS), { postId: "job-1", userId: "alice", comment: "hi" }));
    await assertFails(addDoc(collection(db, COLLECTIONS.JOB_RATINGS), { postId: "job-1", userId: "alice", rating: 5 }));
  });

  it("cannot write their own notification preferences", async () => {
    await assertFails(updateDoc(doc(alice(), COLLECTIONS.USER_NOTI, "noti-alice"), { category: [] }));
  });

  it("cannot write to a collection the rules don't mention", async () => {
    await assertFails(setDoc(doc(alice(), "SomethingNew", "x"), { a: 1 }));
  });
});
