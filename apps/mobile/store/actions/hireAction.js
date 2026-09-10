export const TOGGLE_FAVORITE = "TOGGLE_FAVORITE";
export const LINK_JOB = "LINK_JOB";
export const HIRE_RATING = "HIRE_RATING";
export const toggleFavorite = (id) => {
    return { type: TOGGLE_FAVORITE, jobId: id };
   };

export const linkJobDetail = (id) => {
    return { type: LINK_JOB, jobId: id };
   };
   export const hireRating = (jobId, rating) => {
    return {
        type: HIRE_RATING,
        jobId,
        rating,
    };};