import type { JobPost } from "@jobapp-platform/shared";
import type { Timestamp } from "firebase/firestore";

export function timeAgo(at?: Timestamp) {
  if (typeof at?.toMillis !== "function") return "";
  const minutes = Math.floor((Date.now() - at.toMillis()) / 60_000);
  if (minutes < 1) return "เมื่อสักครู่";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} วันที่แล้ว`;
  return at.toDate().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
}

/** Posted within the last three days. */
export const isNew = (at?: Timestamp) =>
  typeof at?.toMillis === "function" && Date.now() - at.toMillis() < 3 * 24 * 60 * 60_000;

// Legacy wages are free text ("15,000", "ตามตกลง"); only plain numbers get separators.
const amount = (value: string) => (/^\d+$/.test(value) ? Number(value).toLocaleString("en-US") : value);

export function formatWage(job: Pick<JobPost, "wage" | "wageMax" | "employmentType">) {
  const range = job.wageMax ? `${amount(job.wage)} - ${amount(job.wageMax)}` : amount(job.wage ?? "");
  return `${range} บาท${job.employmentType ? ` / ${job.employmentType}` : ""}`;
}
