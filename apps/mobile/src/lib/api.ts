import type {
  CreateHirePostInput,
  CreateJobPostInput,
  PostKind,
  RegisterInput,
  UpdateHirePostInput,
  UpdateJobPostInput,
  UpdateUserProfileInput,
} from "@jobapp-platform/shared";
import { File } from "expo-file-system";
import { auth, getDevHost } from "./firebase";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${getDevHost()}:4000`;
const TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

// The API answers { error: string } or, for Zod failures, { error: { fieldErrors } }.
function messageFrom(status: number, body: any): string {
  if (typeof body?.error === "string") return body.error;
  const firstFieldError = Object.values(body?.error?.fieldErrors ?? {}).flat()[0];
  if (typeof firstFieldError === "string") return firstFieldError;
  return `เกิดข้อผิดพลาด (${status})`;
}

type RequestOptions = { method?: string; body?: unknown; signedIn?: boolean; timeoutMs?: number };

async function request<T>(
  path: string,
  { method = "GET", body, signedIn = true, timeoutMs = TIMEOUT_MS }: RequestOptions = {},
): Promise<T> {
  const isForm = body instanceof FormData;
  const headers: Record<string, string> = {};
  // fetch sets the multipart boundary itself for FormData.
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  if (signedIn) {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new ApiError("กรุณาเข้าสู่ระบบก่อน", 401);
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    // The message below is a guess for the user; the real cause goes to the Metro log.
    if (__DEV__) console.warn(`${method} ${path} failed before a response:`, error);
    throw new ApiError(
      (error as Error)?.name === "AbortError"
        ? "เซิร์ฟเวอร์ไม่ตอบสนอง กรุณาลองใหม่"
        : "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบว่า API กำลังทำงานอยู่",
      0,
    );
  } finally {
    clearTimeout(timer);
  }

  // Not every response is JSON — a wrong EXPO_PUBLIC_API_URL can reach something
  // that answers HTML, and parsing that must not crash the screen.
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    if (res.ok) throw new ApiError("เซิร์ฟเวอร์ตอบกลับมาในรูปแบบที่ไม่รู้จัก", res.status);
  }
  if (!res.ok) throw new ApiError(messageFrom(res.status, data), res.status);
  return data as T;
}

export const api = {
  register: (input: RegisterInput) =>
    request<{ uid: string }>("/auth/register", { method: "POST", body: input, signedIn: false }),

  toggleFavorite: (postKind: PostKind, postId: string) =>
    request<{ favorited: boolean }>("/favorites/toggle", { method: "POST", body: { postKind, postId } }),

  rate: (postKind: PostKind, postId: string, rating: number) =>
    request("/ratings", { method: "PUT", body: { postKind, postId, rating } }),

  addComment: (postKind: PostKind, postId: string, comment: string) =>
    request<{ id: string }>(`/comments/${postKind}`, { method: "POST", body: { postId, comment } }),

  deleteComment: (postKind: PostKind, id: string) =>
    request(`/comments/${postKind}/${id}`, { method: "DELETE" }),

  createPost: (postKind: PostKind, data: CreateJobPostInput | CreateHirePostInput) =>
    request<{ id: string }>(`/posts/${postKind}`, { method: "POST", body: data }),

  updatePost: (postKind: PostKind, id: string, data: UpdateJobPostInput | UpdateHirePostInput) =>
    request(`/posts/${postKind}/${id}`, { method: "PUT", body: data }),

  deletePost: (postKind: PostKind, id: string) => request(`/posts/${postKind}/${id}`, { method: "DELETE" }),

  updateMe: (data: UpdateUserProfileInput) => request("/users/me", { method: "PUT", body: data }),

  /** Uploads a local image (file:// URI) to Cloudinary through the API. */
  uploadImage: (uri: string, folder: "posts" | "profiles" | "resumes") => {
    const form = new FormData();
    // `folder` must come before the file: the API reads fields up to the file part.
    form.append("folder", folder);
    // Expo's fetch takes a real File; the legacy { uri, name, type } object throws
    // "Unsupported FormDataPart implementation".
    form.append("file", new File(uri));
    return request<{ url: string; publicId: string }>("/uploads", { method: "POST", body: form, timeoutMs: 60_000 });
  },
};
