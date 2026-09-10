export const TOGGLE_FAVORITE = "TOGGLE_FAVORITE";
export const LINK_JOB = "LINK_JOB";
export const FILTER_JOBS = 'FILTER_JOBS';
export const SCORE_RATING = "SCORE_RATING";
export const filterJobs = (selected) => {
  return {
    type: FILTER_JOBS,
    selected,
    
  };
};

export const toggleFavorite = (id) => {
    return { type: TOGGLE_FAVORITE, jobId: id };
   };

export const linkJobDetail = (id) => {
    return { type: LINK_JOB, jobId: id };
   };

export const scoreRating = (jobId, rating) => {
    return {
        type: SCORE_RATING,
        jobId,
        rating,
    };
};