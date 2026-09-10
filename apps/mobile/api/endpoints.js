import { apiRequest } from "./client";

/**
 * One place that knows the shape of the backend. Screens call these rather
 * than assembling paths, so a route change is a single edit here.
 *
 * None of these take a user id: the server reads it from the ID token.
 */

export const favorites = {
  toggle: (postKind, postId) =>
    apiRequest("/favorites/toggle", {
      method: "POST",
      body: { postKind, postId },
    }),
};

export const ratings = {
  upsert: (postKind, postId, rating) =>
    apiRequest("/ratings", {
      method: "PUT",
      body: { postKind, postId, rating },
    }),
};

export const comments = {
  create: (postKind, postId, comment) =>
    apiRequest(`/comments/${postKind}`, {
      method: "POST",
      body: { postId, comment },
    }),

  remove: (postKind, id) =>
    apiRequest(`/comments/${postKind}/${id}`, { method: "DELETE" }),
};

export const posts = {
  create: (postKind, data) =>
    apiRequest(`/posts/${postKind}`, { method: "POST", body: data }),

  update: (postKind, id, data) =>
    apiRequest(`/posts/${postKind}/${id}`, { method: "PUT", body: data }),

  remove: (postKind, id) =>
    apiRequest(`/posts/${postKind}/${id}`, { method: "DELETE" }),
};

export const users = {
  me: () => apiRequest("/users/me"),

  updateMe: (data) => apiRequest("/users/me", { method: "PUT", body: data }),

  notiPreferences: () => apiRequest("/users/me/noti-preferences"),

  updateNotiPreferences: (category) =>
    apiRequest("/users/me/noti-preferences", {
      method: "PUT",
      body: { category },
    }),
};

export const auth = {
  // Unauthenticated by definition — there is no token until this succeeds.
  register: (data) =>
    apiRequest("/auth/register", { method: "POST", body: data, auth: false }),
};
