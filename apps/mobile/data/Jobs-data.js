import { liveCollection } from "./liveCollection";

export const JOBS = liveCollection("JobPosts", []);
export const FAVORITEJOBS = liveCollection("FavoriteJobs", []);
export const COMMENTS = liveCollection("JobComments", []);

// Reads "JobRatings", not "RatingJobs". The old write path used the second
// spelling while this file used the first, so Find-job ratings were saved to a
// collection nothing ever read. The 18 documents stranded there have been
// migrated into JobRatings, and the API writes there too.
export const RATING = liveCollection("JobRatings", []);
