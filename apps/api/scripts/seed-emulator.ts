/**
 * Fills the local Firebase emulators with sample data for development.
 *
 *   npm run emulators        # in one terminal, from the repo root
 *   npm run seed             # in another
 *
 * Wipes the emulators first, so it can be re-run to get back to a known state.
 * Every account's password is "password123" — log in as any of them.
 *
 * Refuses to run unless it is talking to the emulators: it deletes everything
 * before seeding, which against the real project would destroy the real data.
 */
process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
process.env.GCLOUD_PROJECT ??= "demo-jobapp";

const { auth, db, usingEmulators } = await import("../src/firebaseAdmin.js");
const { COLLECTIONS } = await import("@jobapp-platform/shared");
const { FieldValue } = await import("firebase-admin/firestore");

const project = process.env.GCLOUD_PROJECT!;
if (!usingEmulators || !project.startsWith("demo-")) {
  throw new Error("seed-emulator only runs against the Firebase emulators.");
}

const PASSWORD = "password123";
const image = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

async function reset() {
  const firestore = process.env.FIRESTORE_EMULATOR_HOST;
  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  await fetch(`http://${firestore}/emulator/v1/projects/${project}/databases/(default)/documents`, {
    method: "DELETE",
  });
  await fetch(`http://${authHost}/emulator/v1/projects/${project}/accounts`, { method: "DELETE" });
}

const users = [
  {
    uid: "user-somchai",
    email: "somchai@example.test",
    firstName: "สมชาย",
    lastName: "ใจดี",
    job: "HR Manager",
    aboutme: "ดูแลการรับสมัครงานของบริษัทมา 10 ปี",
    phone: "0812345678",
    imageUrl: "https://i.pravatar.cc/300?u=somchai",
    // Fills in the company step of a new job post.
    companyName: "บริษัท ไทยเทค จำกัด",
    companyLocation: "สาทร กรุงเทพมหานคร",
    companyEmail: "hr@thaitech.example.test",
    companyPhone: "021234567",
  },
  {
    uid: "user-malee",
    email: "malee@example.test",
    firstName: "มาลี",
    lastName: "รักงาน",
    job: "Graphic Designer",
    aboutme: "นักออกแบบอิสระ รับงานโลโก้และสื่อสิ่งพิมพ์",
    phone: "0898765432",
    imageUrl: "https://i.pravatar.cc/300?u=malee",
  },
  {
    uid: "user-anan",
    email: "anan@example.test",
    firstName: "อนันต์",
    lastName: "ขยัน",
    job: "Frontend Developer",
    aboutme: "กำลังหางานสาย React Native",
    phone: "0861112222",
  },
];

const jobPosts = [
  {
    id: "job-frontend",
    postById: "user-somchai",
    jobTitle: "รับสมัคร Frontend Developer",
    position: "Frontend Developer",
    agency: "บริษัท ไทยเทค จำกัด",
    category: "งานไอที",
    employmentType: "รายเดือน",
    wage: "35000",
    // The fields from the step-by-step form; the other seeded posts are the older shape.
    wageMax: "50000",
    jobType: "งานเต็มเวลา",
    workModel: "ไฮบริด",
    location: "สาทร กรุงเทพมหานคร",
    openings: 2,
    detail: "พัฒนาเว็บและแอปด้วย React / React Native ทำงานแบบ hybrid",
    attributes: ["มีประสบการณ์ React 1 ปีขึ้นไป", "สื่อสารภาษาอังกฤษได้"],
    welfareBenefits: ["ประกันสุขภาพ", "Work from home 2 วัน/สัปดาห์"],
    // Several images; the other seeded posts keep the old single-image fields.
    images: ["frontend", "office", "team"].map((seed) => ({ url: image(seed) })),
  },
  {
    id: "job-accountant",
    postById: "user-somchai",
    jobTitle: "ด่วน! รับสมัครพนักงานบัญชี",
    position: "Accountant",
    agency: "บริษัท ไทยเทค จำกัด",
    category: "งานบัญชี",
    employmentType: "รายเดือน",
    wage: "25000",
    detail: "ดูแลบัญชีรายรับรายจ่าย ปิดงบประจำเดือน",
    attributes: ["ป.ตรี บัญชี"],
    welfareBenefits: ["โบนัสประจำปี"],
    imageUrl: image("accountant"),
  },
  {
    id: "job-barista",
    postById: "user-malee",
    jobTitle: "รับสมัครบาริสต้า พาร์ทไทม์",
    position: "Barista",
    agency: "ร้านกาแฟหน้ามอ",
    category: "งานอาหาร",
    employmentType: "รายวัน",
    wage: "450",
    detail: "ชงกาแฟ ดูแลหน้าร้าน ทำงานเสาร์-อาทิตย์",
    attributes: [],
    welfareBenefits: ["อาหารกลางวัน"],
  },
  {
    id: "job-builder",
    postById: "user-somchai",
    jobTitle: "ช่างก่อสร้างรายวัน",
    position: "Construction worker",
    agency: "ห้างหุ้นส่วน สร้างดี",
    category: "งานก่อสร้าง",
    employmentType: "รายวัน",
    wage: "500",
    detail: "งานก่อสร้างบ้านพักอาศัย ย่านบางนา",
    attributes: ["มีประสบการณ์งานปูน"],
    welfareBenefits: [],
    imageUrl: image("builder"),
  },
];

const hirePosts = [
  {
    id: "hire-designer",
    postById: "user-malee",
    hireTitle: "รับออกแบบโลโก้และแบรนด์",
    category: "งานออกแบบ",
    detail: "ออกแบบโลโก้ นามบัตร และสื่อโซเชียล ส่งงานภายใน 5 วัน",
    phone: "0898765432",
    email: "malee@example.test",
    images: ["designer", "logo", "brand"].map((seed) => ({ url: image(seed) })),
  },
  {
    id: "hire-dev",
    postById: "user-anan",
    hireTitle: "รับทำแอปมือถือ React Native",
    category: "งานไอที",
    detail: "รับทำแอปขนาดเล็กถึงกลาง มีผลงานให้ดู",
    phone: "0861112222",
    email: "anan@example.test",
  },
];

await reset();

for (const { uid, email, firstName, lastName, ...profile } of users) {
  await auth.createUser({ uid, email, password: PASSWORD, displayName: `${firstName} ${lastName}` });
  await db.collection(COLLECTIONS.USER_INFO).doc(uid).set({
    email,
    firstName,
    lastName,
    line: "",
    facebook: "",
    bachelor: "",
    master: "",
    doctoral: "",
    ...profile,
    createdAt: FieldValue.serverTimestamp(),
  });
}

for (const { id, ...post } of jobPosts) {
  await db.collection(COLLECTIONS.JOB_POSTS).doc(id).set({
    email: "hr@example.test",
    phone: "021234567",
    ...post,
    createdAt: FieldValue.serverTimestamp(),
  });
}

for (const { id, ...post } of hirePosts) {
  await db.collection(COLLECTIONS.HIRE_POSTS).doc(id).set({
    ...post,
    createdAt: FieldValue.serverTimestamp(),
  });
}

const comments = [
  [COLLECTIONS.JOB_COMMENTS, "job-frontend", "user-anan", "สนใจครับ ส่ง resume ทางอีเมลได้ไหมครับ"],
  [COLLECTIONS.JOB_COMMENTS, "job-frontend", "user-malee", "บริษัทนี้บรรยากาศดีมากค่ะ"],
  [COLLECTIONS.JOB_COMMENTS, "job-barista", "user-anan", "รับนักศึกษาไหมครับ"],
  [COLLECTIONS.HIRE_COMMENTS, "hire-designer", "user-somchai", "ผลงานสวยมาก ขอใบเสนอราคาหน่อยครับ"],
] as const;

for (const [collection, postId, userId, comment] of comments) {
  await db.collection(collection).add({ postId, userId, comment, createdAt: FieldValue.serverTimestamp() });
}

const ratings = [
  [COLLECTIONS.JOB_RATINGS, "job-frontend", "user-anan", 5],
  [COLLECTIONS.JOB_RATINGS, "job-frontend", "user-malee", 4],
  [COLLECTIONS.JOB_RATINGS, "job-barista", "user-anan", 3],
  [COLLECTIONS.HIRE_RATINGS, "hire-designer", "user-somchai", 5],
] as const;

for (const [collection, postId, userId, rating] of ratings) {
  await db.collection(collection).add({ postId, userId, rating });
}

await db.collection(COLLECTIONS.FAVORITE_JOBS).add({ postId: "job-frontend", userId: "user-anan" });
await db.collection(COLLECTIONS.FAVORITE_JOBS).add({ postId: "job-builder", userId: "user-anan" });
await db.collection(COLLECTIONS.USER_NOTI).add({ notiBy: "user-anan", category: ["งานไอที"] });
await db.collection(COLLECTIONS.USER_NOTI).add({ notiBy: "user-somchai", category: ["งานออกแบบ", "งานไอที"] });

// What the API would have written for the comments and ratings above, so the
// notification screens have something to show without clicking through first.
const notifications = [
  { userId: "user-somchai", type: "comment", postKind: "find", postId: "job-frontend", postTitle: "รับสมัคร Frontend Developer", actorIds: ["user-malee", "user-anan"], actorCount: 2, read: false },
  { userId: "user-somchai", type: "rating", postKind: "find", postId: "job-frontend", postTitle: "รับสมัคร Frontend Developer", actorIds: ["user-malee", "user-anan"], actorCount: 2, read: false },
  { userId: "user-somchai", type: "new_post", postKind: "hire", postId: "hire-designer", postTitle: "รับออกแบบโลโก้และแบรนด์", actorIds: ["user-malee"], actorCount: 1, read: true },
  { userId: "user-malee", type: "comment", postKind: "find", postId: "job-barista", postTitle: "รับสมัครบาริสต้า พาร์ทไทม์", actorIds: ["user-anan"], actorCount: 1, read: false },
  { userId: "user-malee", type: "comment", postKind: "hire", postId: "hire-designer", postTitle: "รับออกแบบโลโก้และแบรนด์", actorIds: ["user-somchai"], actorCount: 1, read: false },
] as const;

for (const n of notifications) {
  await db
    .collection(COLLECTIONS.NOTIFICATIONS)
    .doc(`${n.userId}_${n.type}_${n.postId}`)
    .set({ ...n, updatedAt: FieldValue.serverTimestamp() });
}

console.log(`Seeded ${users.length} users, ${jobPosts.length} job posts, ${hirePosts.length} hire posts,`);
console.log(`${comments.length} comments, ${ratings.length} ratings. Password for every account: ${PASSWORD}`);
console.log(users.map((u) => `  ${u.email}`).join("\n"));
process.exit(0);
