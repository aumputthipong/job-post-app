import type { RegisterInput } from "@jobapp-platform/shared";
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

async function request<T>(
  path: string,
  { method = "GET", body, signedIn = true }: { method?: string; body?: unknown; signedIn?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (signedIn) {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new ApiError("กรุณาเข้าสู่ระบบก่อน", 401);
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบว่า API กำลังทำงานอยู่", 0);
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(messageFrom(res.status, data), res.status);
  return data as T;
}

export const api = {
  register: (input: RegisterInput) =>
    request<{ uid: string }>("/auth/register", { method: "POST", body: input, signedIn: false }),
};
