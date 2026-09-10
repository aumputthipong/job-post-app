import firebase from "../database/firebaseDB";


export const NOTI = [];
const notiCollection = firebase.firestore().collection('User Noti');

// Create a real-time listener to fetch and update data when it changes
notiCollection.onSnapshot((querySnapshot) => {
  NOTI.length = 0; // Clear the existing data

  querySnapshot.forEach((doc) => {
    const notiData = doc.data();
    const notiId = doc.id;
    // Include the document ID as part of the data
    const notiWithId = { id: notiId, ...notiData };
    NOTI.push(notiWithId);
  });
});

// Optionally, you can also handle any errors that occur during the real-time listener
notiCollection.onSnapshot((querySnapshot) => {
  // Handle changes as before
}, (error) => {
  console.error("Error getting real-time noti updates: ", error);
});

