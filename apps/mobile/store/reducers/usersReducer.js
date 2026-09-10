import { USERS } from "../../data/Users-data";
// import { TOGGLE_FAVORITE } from "../actions/jobAction";
// import { LINK_JOB } from "../actions/jobAction";


const initialState = {
    users: USERS,
    filteredUsers:USERS ,
    selectedUser:USERS[0] ,
    favoriteUsers: []
    };

    const usersReducer = (state = initialState, action) => {
        switch (action.type) {
            // case TOGGLE_FAVORITE:
                
            //     const updatedFavoriteJobs = [...state.favoriteJobs];
            //     const favIndex = updatedFavoriteJobs.findIndex((jobId) => jobId === action.jobId);
    
            //     if (favIndex === -1) {
            //         updatedFavoriteJobs.push(action.jobId);
            //         console.log('push', updatedFavoriteJobs);
            //         console.log('favIndex', favIndex);
            //     }
            //     else {
            //         updatedFavoriteJobs.splice(favIndex, 1);
            //         console.log('splice');
            //     }
            //     return {
            //         ...state,
            //         favoriteJobs: updatedFavoriteJobs, 
            //     };
                
            //     case LINK_JOB:
                
                // const selectedJob = [...state.favoriteJobs];
    
               
    
            default:
                return state;
        }
    }
    
    export default usersReducer;