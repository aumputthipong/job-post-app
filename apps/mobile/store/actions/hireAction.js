import { favorites, ratings } from "../../api/endpoints";

export const TOGGLE_FAVORITE = "TOGGLE_FAVORITE";
export const LINK_JOB = "LINK_JOB";
export const HIRE_RATING = "HIRE_RATING";

// See jobAction.js for why these became thunks.

export const toggleFavorite = (id) => async (dispatch) => {
  const { favorited } = await favorites.toggle("hire", id);
  dispatch({ type: TOGGLE_FAVORITE, jobId: id, favorited });
};

export const hireRating = (jobId, rating) => async (dispatch) => {
  await ratings.upsert("hire", jobId, rating);
  dispatch({ type: HIRE_RATING, jobId, rating });
};

export const linkJobDetail = (id) => ({ type: LINK_JOB, jobId: id });
