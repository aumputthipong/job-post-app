import { favorites, ratings, users } from "../../api/endpoints";

export const TOGGLE_FAVORITE = "TOGGLE_FAVORITE";
export const LINK_JOB = "LINK_JOB";
export const FILTER_JOBS = "FILTER_JOBS";
export const SCORE_RATING = "SCORE_RATING";

/**
 * These used to be plain action objects, with the Firestore write happening
 * inside the reducer. A reducer is meant to be a pure function of state and
 * action; writing to the network from one meant the store and the database
 * could disagree whenever a write failed, and nothing was able to observe
 * that failure.
 *
 * The request now happens here and the reducer is only told the outcome.
 * Call sites are unchanged — they still dispatch(toggleFavorite(id)) — but
 * they can now await the result and show an error if it rejects.
 */

export const toggleFavorite = (id) => async (dispatch) => {
  const { favorited } = await favorites.toggle("find", id);
  dispatch({ type: TOGGLE_FAVORITE, jobId: id, favorited });
};

export const scoreRating = (jobId, rating) => async (dispatch) => {
  await ratings.upsert("find", jobId, rating);
  dispatch({ type: SCORE_RATING, jobId, rating });
};

export const filterJobs = (selected) => async (dispatch) => {
  await users.updateNotiPreferences(selected);
  dispatch({ type: FILTER_JOBS, selected });
};

export const linkJobDetail = (id) => ({ type: LINK_JOB, jobId: id });
