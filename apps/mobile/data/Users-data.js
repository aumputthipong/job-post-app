import firebase from "../database/firebaseDB";

export const USERS = [];
const usersCollection = firebase.firestore().collection('User Info');

// Create a real-time listener to fetch and update data when it changes
usersCollection.onSnapshot((querySnapshot) => {
  USERS.length = 0; // Clear the existing data

  querySnapshot.forEach((doc) => {
    const userData = doc.data();
    const userId = doc.id;
    // Include the document ID as part of the data
    const userWithId = { id: userId, ...userData };
    USERS.push(userWithId);
  });
});

// Optionally, you can also handle any errors that occur during the real-time listener
usersCollection.onSnapshot((querySnapshot) => {
  // Handle changes as before
}, (error) => {
  console.error("Error getting real-time users updates: ", error);
});