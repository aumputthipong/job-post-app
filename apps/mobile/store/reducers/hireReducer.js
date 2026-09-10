import { COMMENTS, HIRES,RATING } from "../../data/Hires-data";
// import { TOGGLE_FAVORITE } from "../actions/jobAction";
// import { LINK_JOB } from "../actions/jobAction";
import firebase from "../../database/firebaseDB";
import{ HIRE_RATING } from "../actions/hireAction";
const initialState = {
    hires: HIRES,
    filteredHires:HIRES ,
    selectedHire:HIRES[0] ,
    favoriteHires: [],
    comments:COMMENTS,
    ratingJobs: RATING,
    };

    const hiresReducer = (state = initialState, action) => {
        switch (action.type) {
    case HIRE_RATING:
            const currentUserIdforRating = firebase.auth().currentUser.uid;
            const updatedRatingJobs = [...state.ratingJobs];
            const ratingIndex = updatedRatingJobs.findIndex((job) => job.postId === action.jobId && job.userId === currentUserIdforRating);
   
            if (ratingIndex === -1) {  
               updatedRatingJobs.push( {postId:action.jobId,userId:currentUserIdforRating,rating:action.rating});
                console.log('add', updatedRatingJobs);
                // console.log(updatedRatingJobs);

                firebase.firestore().collection("HireRatings").add({
                    postId: action.jobId,
                    userId: currentUserIdforRating,
                    rating: action.rating,
                })

                .then(() => {
                    console.log('Rating added to Firebase');
                })
                .catch((error) => {
                    console.error('Error adding rating to firebase: ', error);
                });
        } else {
            const updatedRating = {
                postId: action.jobId,
                userId: currentUserIdforRating,
                rating: action.rating,
            };
    
            updatedRatingJobs[ratingIndex] = updatedRating;
    
            firebase.firestore().collection("HireRatings")
                .where("postId", "==", action.jobId)
                .where("userId", "==", currentUserIdforRating)
                .get()
                .then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        doc.ref.update(updatedRating)
                            .then(() => {
                                console.log('Rating updated on Firebase');
                            })
                            .catch((error) => {
                                console.error('Error updating rating on Firebase: ', error);
                            });
                    });
                })
                .catch((error) => {
                    console.error('Error updating rating on Firebase: ', error);
                });
        }
        console.log("Updated Ratings", updatedRatingJobs);
    
        return {
            ...state,
            ratingJobs: updatedRatingJobs,
        };
            default:
                return state;
        }
    }
    
    export default hiresReducer;