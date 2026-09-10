import { liveCollection } from "./liveCollection";

// Filtered to the signed-in user's own row. Reading the whole collection —
// which is what this file used to do — is rejected by the security rules,
// and rightly so: it would hand every user everyone else's notification
// settings. The reducer only ever looks for the current user's row anyway.
export const NOTI = liveCollection("User Noti", [], (query, user) =>
  query.where("notiBy", "==", user.uid),
);
