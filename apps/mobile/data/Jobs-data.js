import firebase from "../database/firebaseDB";


export const JOBS = [];
const jobPostsCollection = firebase.firestore().collection('JobPosts');

// Create a real-time listener to fetch and update data when it changes
jobPostsCollection.onSnapshot((querySnapshot) => {
  JOBS.length = 0; // Clear the existing data

  querySnapshot.forEach((doc) => {
    const jobData = doc.data();
    const jobId = doc.id;
    // Include the document ID as part of the data
    const jobWithId = { id: jobId, ...jobData };
    JOBS.push(jobWithId);
  });
});

// Optionally, you can also handle any errors that occur during the real-time listener
jobPostsCollection.onSnapshot((querySnapshot) => {
  // Handle changes as before
}, (error) => {
  console.error("Error getting real-time jobPosts updates: ", error);
});






export const FAVORITEJOBS = [];
const FavjobPostsCollection = firebase.firestore().collection('FavoriteJobs');

// Create a real-time listener to fetch and update data when it changes
FavjobPostsCollection.onSnapshot((querySnapshot) => {
  FAVORITEJOBS.length = 0; // Clear the existing data

  querySnapshot.forEach((doc) => {
    const favjobData = doc.data();
    const favjobId = doc.id;
    // Include the document ID as part of the data
    const jobWithId = { id: favjobId, ...favjobData };
    FAVORITEJOBS.push(jobWithId);
  });
});

// Optionally, you can also handle any errors that occur during the real-time listener
FavjobPostsCollection.onSnapshot((querySnapshot) => {
  // Handle changes as before
}, (error) => {
  console.error("Error getting real-time FavjobPosts updates: ", error);
});

export const COMMENTS = [];
const commentJobCollection = firebase.firestore().collection('JobComments');

// Create a real-time listener to fetch and update data when it changes
commentJobCollection.onSnapshot((querySnapshot) => {
  COMMENTS.length = 0; // Clear the existing data

  querySnapshot.forEach((doc) => {
    const commentData = doc.data();
    const commentId = doc.id;
    // Include the document ID as part of the data
    const commentWithId = { id: commentId, ...commentData };
    COMMENTS.push(commentWithId);
  });
});

// Optionally, you can also handle any errors that occur during the real-time listener
commentJobCollection.onSnapshot((querySnapshot) => {
  // Handle changes as before
}, (error) => {
  console.error("Error getting real-time FavjobPosts updates: ", error);
});




export const RATING = [];
const ratingJobCollection = firebase.firestore().collection('JobRatings');

// Create a real-time listener to fetch and update data when it changes
ratingJobCollection.onSnapshot((querySnapshot) => {
  RATING.length = 0; // Clear the existing data

  querySnapshot.forEach((doc) => {
    const ratingData = doc.data();
    const ratingId = doc.id;
    // Include the document ID as part of the data
    const ratingWithId = { id: ratingId, ...ratingData };
    RATING.push(ratingWithId);
  });
});

// Optionally, you can also handle any errors that occur during the real-time listener
ratingJobCollection.onSnapshot((querySnapshot) => {
  // Handle changes as before
}, (error) => {
  console.error("Error getting real-time FavjobPosts updates:", error);
});