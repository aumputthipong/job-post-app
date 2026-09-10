import firebase from "../database/firebaseDB";
import { getApiBaseUrl } from "./config";

const DEFAULT_TIMEOUT_MS = 15000;

/** An error the API returned, or a failure reaching it at all. */
export class ApiError extends Error {
  constructor(message, { status = 0, payload = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function authHeaders() {
  const user = firebase.auth().currentUser;
  if (!user) {
    throw new ApiError("กรุณาเข้าสู่ระบบก่อน", { status: 401 });
  }
  // The SDK caches this and refreshes it when it is close to expiring, so
  // calling it per request is cheap and always yields a valid token.
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

/** Turns whatever the server sent into a message worth showing a user. */
function describe(status, payload) {
  if (payload && typeof payload.error === "string") return payload.error;

  // Zod validation failures arrive as { error: { fieldErrors, formErrors } }.
  const fieldErrors = payload?.error?.fieldErrors;
  if (fieldErrors) {
    const first = Object.values(fieldErrors).flat().filter(Boolean)[0];
    if (first) return first;
  }

  if (status === 401) return "กรุณาเข้าสู่ระบบใหม่";
  if (status === 403) return "คุณไม่มีสิทธิ์ทำรายการนี้";
  if (status === 404) return "ไม่พบข้อมูลที่ต้องการ";
  return `เกิดข้อผิดพลาด (${status})`;
}

/**
 * Calls the backend with the caller's Firebase ID token attached.
 *
 * Every write in this app used to go straight from the device to Firestore,
 * which meant the client decided who the author was. The server derives that
 * from this token instead, so none of these calls send a user id.
 */
export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    auth = true,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  const headers = { ...(auth ? await authHeaders() : {}) };
  let payloadToSend;

  if (body instanceof FormData) {
    // Let fetch set the multipart boundary itself.
    payloadToSend = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payloadToSend = JSON.stringify(body);
  }

  // React Native's fetch has no timeout of its own; without this a request to
  // an unreachable dev server hangs until the user gives up.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers,
      body: payloadToSend,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new ApiError("เซิร์ฟเวอร์ไม่ตอบสนอง กรุณาลองใหม่", { status: 0 });
    }
    throw new ApiError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบว่า API กำลังทำงานอยู่", {
      status: 0,
    });
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text();
  const payload = text ? safeParse(text) : null;

  if (!response.ok) {
    throw new ApiError(describe(response.status, payload), {
      status: response.status,
      payload,
    });
  }

  return payload;
}

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Uploads one image and returns { url, publicId }.
 *
 * Replaces firebase.storage().put(): Firebase Storage is unusable on this
 * project (no billing account, so it answers 402), and routing uploads through
 * the API keeps the storage credentials off the device.
 */
export async function uploadImage(uri, folder = "posts") {
  const name = uri.split("/").pop() || "upload.jpg";
  const extension = name.split(".").pop()?.toLowerCase();
  const type = extension === "png" ? "image/png" : "image/jpeg";

  const form = new FormData();
  form.append("folder", folder);
  form.append("file", { uri, name, type });

  return apiRequest("/uploads", {
    method: "POST",
    body: form,
    timeoutMs: 60000, // uploads over a phone connection need the extra room
  });
}
