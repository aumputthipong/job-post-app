
import { JOBS,FAVORITEJOBS, COMMENTS,RATING } from "../../data/Jobs-data";

import { NOTI } from "../../data/Noti-data";

import { TOGGLE_FAVORITE,SCORE_RATING } from "../actions/jobAction";
import { LINK_JOB } from "../actions/jobAction";
import { FILTER_JOBS } from '../actions/jobAction';
import { SET_NEW_POST_AVAILABLE } from '../actions/jobAction';
import firebase from "../../database/firebaseDB";


const initialState = {
    jobs: JOBS,
    filteredJobs: JOBS,
    filterJob: JOBS,

    selectedJob:JOBS[0] ,
    favoriteJobs: FAVORITEJOBS,
    comments:COMMENTS,
    notiData: NOTI,
    ratingJobs: RATING,
    
};


    const jobsReducer = (state = initialState, action) => {

        switch (action.type) {
            case TOGGLE_FAVORITE:
                const currentUserId = firebase.auth().currentUser.uid;
                const updatedFavoriteJobs = [...state.favoriteJobs];
                const favIndex = updatedFavoriteJobs.findIndex((job) => job.postId === action.jobId && job.userId === currentUserId);
              
                if (favIndex === -1) {  
                    updatedFavoriteJobs.push( {postId:action.jobId,userId:currentUserId});
                    // console.log('push', updatedFavoriteJobs);
                    // console.log(updatedFavoriteJobs);
                    firebase.firestore().collection("FavoriteJobs").add({
                        postId: action.jobId,
                        userId: currentUserId
                    })
            
                    .then(() => {
                        console.log('Job added to favorites on Firebase');
                    })
                    .catch((error) => {
                        console.error('Error adding job to favorites: ', error);
                    });
            }
            else {
                updatedFavoriteJobs.splice(favIndex, 1);
                firebase.firestore().collection("FavoriteJobs")
                    .where("postId", "==", action.jobId)
                    .where("userId", "==", currentUserId)
                    .get()
                    .then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            doc.ref.delete().then(() => {
                                console.log('Job removed from favorites on Firebase');
                            }).catch((error) => {
                                console.error('Error removing job from favorites: ', error);
                            });
                        });
                    })
                    .catch((error) => {
                        console.error('Error removing job from favorites: ', error);
                    });

            }
            console.log(updatedFavoriteJobs)
            return {
                ...state,
                favoriteJobs: updatedFavoriteJobs,
            };
            // rating
        case SCORE_RATING:
            const currentUserIdforRating = firebase.auth().currentUser.uid;
            const updatedRatingJobs = [...state.ratingJobs];
            const ratingIndex = updatedRatingJobs.findIndex((job) => job.postId === action.jobId && job.userId === currentUserIdforRating);
   
            if (ratingIndex === -1) {  
               updatedRatingJobs.push( {postId:action.jobId,userId:currentUserIdforRating,rating:action.rating});
                console.log('add', updatedRatingJobs);
                // console.log(updatedRatingJobs);

                firebase.firestore().collection("RatingJobs").add({
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
        }
        else {
            const updatedRating = {
                postId: action.jobId,
                userId: currentUserIdforRating,
                rating: action.rating,
            };
    
            updatedRatingJobs[ratingIndex] = updatedRating;
    
            firebase.firestore().collection("RatingJobs")
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
        case LINK_JOB:
        // const selectedJob = [...state.favoriteJobs];
        case FILTER_JOBS:
            const { selected } = action;
            const userId = firebase.auth().currentUser.uid;
            const updatedNoti = [...state.notiData];
            const notiIndex = updatedNoti.findIndex((noti) => noti.notiBy === userId);

            if (notiIndex === -1) {
                updatedNoti.push({ category: selected, notiBy: userId });
                firebase.firestore().collection("User Noti").add({
                    category: selected,
                    notiBy: userId
                })
                    .then((docRef) => {
                        const docId = docRef.id;
                        updatedNoti.push({ category: selected, notiBy: userId, docId: docId });
                        return {
                            ...state,
                            notiData: updatedNoti
                        };
                    })
                    .then(() => {
                        console.log('Notification added to Noti on Firebase');
                    })
                    .catch((error) => {
                        console.error('Error adding notification to Noti: ', error);
                    });
            } else {
                const docId = updatedNoti[notiIndex].id;
                firebase.firestore().collection("User Noti").doc(docId).update({
                    category: selected,
                    notiBy: userId
                })
                    .then(() => {
                        console.log("Notification updated in Noti on Firebase");
                    })
                    .catch((error) => {
                        console.error("Error updating notification in Noti: ", error);
                    });
                const updatedNotiData = [...updatedNoti];
                updatedNotiData[notiIndex].category = selected;
            }

            // เมื่ออัปเดตข้อมูลแล้วคุณควรอัปเดต local state เช่น notiData
            if (selected.length === 0) {
                // ถ้าไม่มีค่าที่ถูกเลือก ให้แสดงทั้งหมด
                return { ...state, filterJob: state.jobs };
              }
            
              // ดำเนินการกรองโพสต์ตามค่าที่ถูกเลือก
              const filteredJobs = state.jobs.filter((job) => {
                return selected.includes(job.category);
              });
              
              return { ...state, filterJob: filteredJobs };
           

        
        // ... กรณีอื่น ๆ
        default:
            return state;
    }

}

export default jobsReducer;