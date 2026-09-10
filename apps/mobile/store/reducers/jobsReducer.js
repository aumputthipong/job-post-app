import { JOBS, FAVORITEJOBS, COMMENTS, RATING } from "../../data/Jobs-data";
import { NOTI } from "../../data/Noti-data";
import firebase from "../../database/firebaseDB";
import {
  TOGGLE_FAVORITE,
  SCORE_RATING,
  LINK_JOB,
  FILTER_JOBS,
} from "../actions/jobAction";

const initialState = {
  jobs: JOBS,
  filteredJobs: JOBS,
  filterJob: JOBS,
  selectedJob: JOBS[0],
  favoriteJobs: FAVORITEJOBS,
  comments: COMMENTS,
  notiData: NOTI,
  ratingJobs: RATING,
};

/**
 * Pure again. Every case here used to fire Firestore writes and log their
 * results; those moved to the thunks in ../actions/jobAction.js. The reducer
 * now only mirrors a change the server has already accepted, so the store can
 * no longer claim a write succeeded when it actually failed.
 */
const jobsReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_FAVORITE: {
      const currentUserId = firebase.auth().currentUser?.uid;
      if (!currentUserId) return state;

      const favoriteJobs = state.favoriteJobs.filter(
        (job) => !(job.postId === action.jobId && job.userId === currentUserId),
      );

      // `favorited` is what the server actually did, not a guess made here.
      if (action.favorited) {
        favoriteJobs.push({ postId: action.jobId, userId: currentUserId });
      }

      return { ...state, favoriteJobs };
    }

    case SCORE_RATING: {
      const currentUserId = firebase.auth().currentUser?.uid;
      if (!currentUserId) return state;

      const ratingJobs = [...state.ratingJobs];
      const existing = ratingJobs.findIndex(
        (job) => job.postId === action.jobId && job.userId === currentUserId,
      );
      const entry = {
        postId: action.jobId,
        userId: currentUserId,
        rating: action.rating,
      };

      if (existing === -1) ratingJobs.push(entry);
      else ratingJobs[existing] = entry;

      return { ...state, ratingJobs };
    }

    case FILTER_JOBS: {
      const { selected } = action;

      // No categories selected means "show everything".
      const filterJob =
        selected.length === 0
          ? state.jobs
          : state.jobs.filter((job) => selected.includes(job.category));

      return { ...state, filterJob };
    }

    case LINK_JOB:
      return state;

    default:
      return state;
  }
};

export default jobsReducer;
