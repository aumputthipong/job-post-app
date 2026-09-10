import { COMMENTS, HIRES, RATING } from "../../data/Hires-data";
import firebase from "../../database/firebaseDB";
import { HIRE_RATING, TOGGLE_FAVORITE } from "../actions/hireAction";

const initialState = {
  hires: HIRES,
  filteredHires: HIRES,
  selectedHire: HIRES[0],
  favoriteHires: [],
  comments: COMMENTS,
  ratingJobs: RATING,
};

// Pure, for the same reason as jobsReducer — the Firestore write moved to the
// thunk in ../actions/hireAction.js.
const hiresReducer = (state = initialState, action) => {
  switch (action.type) {
    case HIRE_RATING: {
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

    case TOGGLE_FAVORITE: {
      const currentUserId = firebase.auth().currentUser?.uid;
      if (!currentUserId) return state;

      const favoriteHires = state.favoriteHires.filter(
        (hire) =>
          !(hire.postId === action.jobId && hire.userId === currentUserId),
      );

      if (action.favorited) {
        favoriteHires.push({ postId: action.jobId, userId: currentUserId });
      }

      return { ...state, favoriteHires };
    }

    default:
      return state;
  }
};

export default hiresReducer;
