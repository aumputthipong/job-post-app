import firebase from "../database/firebaseDB";

export const HIRES = [];
const hirePostsCollection = firebase.firestore().collection('HirePosts');

// Create a real-time listener to fetch and update data when it changes
hirePostsCollection.onSnapshot((querySnapshot) => {
  HIRES.length = 0; // Clear the existing data

  querySnapshot.forEach((doc) => {
    const hireData = doc.data();
    const hireId = doc.id;
    // Include the document ID as part of the data
    const hireWithId = { id: hireId, ...hireData };
    HIRES.push(hireWithId);
  });
});

// Optionally, you can also handle any errors that occur during the real-time listener
hirePostsCollection.onSnapshot((querySnapshot) => {
  // Handle changes as before
}, (error) => {
  console.error("Error getting real-time hirePosts updates: ", error);
});

export const COMMENTS = [];
const commentHireCollection = firebase.firestore().collection('HireComments');

// Create a real-time listener to fetch and update data when it changes
commentHireCollection.onSnapshot((querySnapshot) => {
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
commentHireCollection.onSnapshot((querySnapshot) => {
  // Handle changes as before
}, (error) => {
  console.error("Error getting real-time FavjobPosts updates: ", error);
});


export const RATING = [];
const ratingJobCollection = firebase.firestore().collection('HireRatings');

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