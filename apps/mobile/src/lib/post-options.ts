import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { colors } from "./colors";

type IconName = ComponentProps<typeof Ionicons>["name"];

// Same strings as the legacy dropdowns: existing posts store these values.
export const CATEGORIES = [
  "งานบัญชี",
  "งานทรัพยากรบุคคล",
  "งานธนาคาร",
  "งานสุขภาพ",
  "งานก่อสร้าง",
  "งานออกแบบ",
  "งานไอที",
  "งานการศึกษา",
  "งานอาหาร",
  "งานธรรมชาติ",
  "งานทั่วไป",
  "อื่นๆ",
];

export const CATEGORY_ICONS: Record<string, IconName> = {
  งานบัญชี: "calculator-outline",
  งานทรัพยากรบุคคล: "people-outline",
  งานธนาคาร: "business-outline",
  งานสุขภาพ: "medkit-outline",
  งานก่อสร้าง: "construct-outline",
  งานออกแบบ: "color-palette-outline",
  งานไอที: "code-slash-outline",
  งานการศึกษา: "school-outline",
  งานอาหาร: "restaurant-outline",
  งานธรรมชาติ: "leaf-outline",
  งานทั่วไป: "briefcase-outline",
  อื่นๆ: "ellipsis-horizontal-outline",
};

type Pastel = keyof typeof colors.pastel;

/** Each category keeps one pastel wherever it shows as a tile, so it becomes recognisable. */
const CATEGORY_PASTELS: Record<string, Pastel> = {
  งานบัญชี: "sky",
  งานทรัพยากรบุคคล: "lilac",
  งานธนาคาร: "mint",
  งานสุขภาพ: "rose",
  งานก่อสร้าง: "butter",
  งานออกแบบ: "peach",
  งานไอที: "sky",
  งานการศึกษา: "lilac",
  งานอาหาร: "peach",
  งานธรรมชาติ: "mint",
  งานทั่วไป: "butter",
  อื่นๆ: "rose",
};

export const categoryPastel = (category: string) => colors.pastel[CATEGORY_PASTELS[category] ?? "peach"];

/** How often the wage is paid; stored in the legacy `employmentType` field. */
export const EMPLOYMENT_TYPES = ["รายเดือน", "รายวัน", "รายชั่วโมง", "ต่อชิ้นงาน"];

export const JOB_TYPES = ["งานเต็มเวลา", "พาร์ทไทม์", "สัญญาจ้าง", "ฝึกงาน", "ฟรีแลนซ์"];

export const WORK_MODELS = ["ทำงานที่ออฟฟิศ", "ไฮบริด", "ทำงานจากที่บ้าน"];

export const SUGGESTED_ATTRIBUTES = [
  "ไม่จำกัดวุฒิการศึกษา",
  "ปริญญาตรีขึ้นไป",
  "รับนักศึกษาจบใหม่",
  "มีประสบการณ์ 1 ปีขึ้นไป",
  "สื่อสารภาษาอังกฤษได้",
];

export const SUGGESTED_BENEFITS = [
  "ประกันสังคม",
  "ประกันสุขภาพ",
  "โบนัสประจำปี",
  "ปรับเงินเดือนประจำปี",
  "ทำงานจากที่บ้านได้",
  "ค่าล่วงเวลา",
];
