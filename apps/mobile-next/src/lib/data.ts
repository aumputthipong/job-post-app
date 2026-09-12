import {
  COLLECTIONS,
  type Comment,
  type HirePost,
  type JobPost,
  type PostKind,
  type Rating,
  type UserProfile,
} from "@jobapp-platform/shared";
import {
  collection,
  doc,
  onSnapshot,
  query,
  type Query,
  type QuerySnapshot,
  type Timestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { type Subscribe, useLiveQuery } from "./live-query";

type Doc<T> = T & { id: string; createdAt?: Timestamp };
export type JobPostDoc = Doc<JobPost>;
export type HirePostDoc = Doc<HirePost>;
export type UserDoc = Doc<UserProfile>;
export type CommentDoc = Doc<Comment>;

const toDocs = <T>(snap: QuerySnapshot) => snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);

// Legacy documents don't all have createdAt, so sort here rather than with
// orderBy — Firestore drops documents missing the orderBy field entirely.
const millis = (d: { createdAt?: Timestamp }) =>
  typeof d.createdAt?.toMillis === "function" ? d.createdAt.toMillis() : 0;
const newestFirst = (a: { createdAt?: Timestamp }, b: { createdAt?: Timestamp }) => millis(b) - millis(a);

function listen<T>(q: Query, transform: (docs: T[]) => T[] = (docs) => docs): Subscribe<T[]> {
  return (onData, onError) => onSnapshot(q, (snap) => onData(transform(toDocs<T>(snap))), onError);
}

function listenDoc<T>(path: string, id: string): Subscribe<Doc<T> | null> {
  return (onData, onError) =>
    onSnapshot(
      doc(db, path, id),
      (snap) => onData(snap.exists() ? ({ id: snap.id, ...snap.data() } as Doc<T>) : null),
      onError,
    );
}

const postCollection = (kind: PostKind) => (kind === "find" ? COLLECTIONS.JOB_POSTS : COLLECTIONS.HIRE_POSTS);

export const useJobPosts = () =>
  useLiveQuery(["jobPosts"], listen<JobPostDoc>(collection(db, COLLECTIONS.JOB_POSTS), (d) => d.sort(newestFirst)));

export const useHirePosts = () =>
  useLiveQuery(["hirePosts"], listen<HirePostDoc>(collection(db, COLLECTIONS.HIRE_POSTS), (d) => d.sort(newestFirst)));

export const useJobPost = (id: string | undefined) =>
  useLiveQuery(["jobPost", id], id ? listenDoc<JobPost>(postCollection("find"), id) : null);

export const useHirePost = (id: string | undefined) =>
  useLiveQuery(["hirePost", id], id ? listenDoc<HirePost>(postCollection("hire"), id) : null);

export const useUser = (id: string | undefined) =>
  useLiveQuery(["user", id], id ? listenDoc<UserProfile>(COLLECTIONS.USER_INFO, id) : null);

/** Every profile, keyed by uid — for showing who wrote a post or comment. */
export function useUsers() {
  const result = useLiveQuery(["users"], listen<UserDoc>(collection(db, COLLECTIONS.USER_INFO)));
  const byId = new Map((result.data ?? []).map((u) => [u.id, u]));
  return { ...result, byId };
}

export function useComments(kind: PostKind, postId: string | undefined) {
  const path = kind === "find" ? COLLECTIONS.JOB_COMMENTS : COLLECTIONS.HIRE_COMMENTS;
  return useLiveQuery(
    ["comments", kind, postId],
    postId
      ? listen<CommentDoc>(query(collection(db, path), where("postId", "==", postId)), (d) =>
          d.sort((a, b) => millis(a) - millis(b)),
        )
      : null,
  );
}

export function useRatingSummary(kind: PostKind, postId: string | undefined) {
  const path = kind === "find" ? COLLECTIONS.JOB_RATINGS : COLLECTIONS.HIRE_RATINGS;
  const result = useLiveQuery(
    ["ratings", kind, postId],
    postId ? listen<Doc<Rating>>(query(collection(db, path), where("postId", "==", postId))) : null,
  );
  const ratings = result.data ?? [];
  const average = ratings.length ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;
  return { ...result, ratings, average, count: ratings.length };
}

export const fullName = (user?: Pick<UserProfile, "firstName" | "lastName"> | null) =>
  user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "ผู้ใช้งาน" : "ผู้ใช้งาน";
