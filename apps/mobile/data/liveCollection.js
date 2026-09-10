import firebase from "../database/firebaseDB";

/**
 * Keeps a module-scope array in sync with a Firestore collection.
 *
 * Two problems with how the data/ files used to do this:
 *
 * 1. They subscribed at import time, which happens before anyone has logged
 *    in. Now that the security rules require authentication, an unauthenticated
 *    listener is rejected with permission-denied and stays dead — the data
 *    never arrives even after the user signs in. Subscribing on auth state
 *    instead means the listener is created with credentials, and torn down
 *    again on sign-out.
 *
 * 2. Each collection registered *two* onSnapshot listeners — one that filled
 *    the array and a second, identical one whose only purpose was to log
 *    errors. That doubled the document reads for no benefit. One listener with
 *    an error callback does both jobs.
 *
 * The array identity is deliberately preserved (cleared and refilled in place)
 * because the reducers capture these arrays as their initial state.
 */
export function liveCollection(collectionName, target, buildQuery) {
  let unsubscribe = null;

  firebase.auth().onAuthStateChanged((user) => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }

    target.length = 0;

    if (!user) return;

    let query = firebase.firestore().collection(collectionName);
    if (buildQuery) query = buildQuery(query, user);

    unsubscribe = query.onSnapshot(
      (snapshot) => {
        target.length = 0;
        snapshot.forEach((doc) => {
          target.push({ id: doc.id, ...doc.data() });
        });
      },
      (error) => {
        console.error(`Error getting real-time ${collectionName} updates:`, error);
      },
    );
  });

  return target;
}
