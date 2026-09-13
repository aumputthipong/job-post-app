/**
 * Canonical Firestore collection names — the SAME Firestore project/data
 * used by the legacy app. Both the API and (eventually) the mobile app
 * must import these instead of typing collection name strings by hand.
 *
 * This exists because the legacy code had two different string literals
 * for the same collection ("RatingJobs" in the write path vs "JobRatings"
 * in the read path), which silently broke Find-job ratings. A shared
 * constant makes that class of bug impossible.
 *
 * NOTE: names with spaces ("User Info", "User Noti") are kept as-is
 * because that's what already exists in the live Firestore data — do not
 * rename them without a data migration.
 */
export const COLLECTIONS = {
  JOB_POSTS: "JobPosts",
  HIRE_POSTS: "HirePosts",
  USER_INFO: "User Info",
  USER_NOTI: "User Noti",
  FAVORITE_JOBS: "FavoriteJobs",
  JOB_COMMENTS: "JobComments",
  HIRE_COMMENTS: "HireComments",
  JOB_RATINGS: "JobRatings",
  HIRE_RATINGS: "HireRatings",
  NOTIFICATIONS: "Notifications",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
