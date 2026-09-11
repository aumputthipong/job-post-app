import type { CreateHirePostInput, CreateJobPostInput } from "@jobapp-platform/shared";

export const PROJECT_ID = process.env.GCLOUD_PROJECT ?? "demo-jobapp";
const FIRESTORE = process.env.FIRESTORE_EMULATOR_HOST!;
const AUTH = process.env.FIREBASE_AUTH_EMULATOR_HOST!;

/** Empties both emulators so every test starts from nothing. */
export async function resetEmulators() {
  await Promise.all([
    fetch(`http://${FIRESTORE}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`, {
      method: "DELETE",
    }),
    fetch(`http://${AUTH}/emulator/v1/projects/${PROJECT_ID}/accounts`, { method: "DELETE" }),
  ]);
}

export type TestUser = { uid: string; idToken: string; email: string };

let counter = 0;

/**
 * Signs a user up against the Auth emulator and returns a real ID token — the
 * same kind the mobile app sends — so requireAuth is exercised for real rather
 * than mocked.
 */
export async function createUser(name = "user"): Promise<TestUser> {
  counter += 1;
  const email = `${name}-${counter}@example.test`;

  const res = await fetch(
    `http://${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "password123", returnSecureToken: true }),
    },
  );
  const body = (await res.json()) as { localId: string; idToken: string };
  if (!res.ok) throw new Error(`signUp failed: ${JSON.stringify(body)}`);

  return { uid: body.localId, idToken: body.idToken, email };
}

export const bearer = (user: TestUser) => ({ authorization: `Bearer ${user.idToken}` });

export function jobPost(overrides: Partial<CreateJobPostInput> = {}): CreateJobPostInput {
  return {
    jobTitle: "Frontend Developer",
    position: "Developer",
    agency: "Acme",
    attributes: ["React"],
    welfareBenefits: ["Health insurance"],
    wage: "30000",
    detail: "Build things",
    category: "งานไอที",
    employmentType: "รายเดือน",
    email: "hr@example.test",
    phone: "0800000000",
    ...overrides,
  };
}

export function hirePost(overrides: Partial<CreateHirePostInput> = {}): CreateHirePostInput {
  return {
    hireTitle: "Freelance designer",
    category: "งานออกแบบ",
    detail: "Available for work",
    phone: "0800000000",
    email: "me@example.test",
    ...overrides,
  };
}
