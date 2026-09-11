import { z } from "zod";

// Messages are in Thai because both the API's 400 responses and the app's form
// validation show them to the user as-is.

export const registerSchema = z.object({
  email: z.string().trim().email("กรุณากรอกอีเมลให้ถูกต้อง"),
  // Firebase Auth rejects anything shorter than 6.
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  firstName: z.string().trim().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().trim().min(1, "กรุณากรอกนามสกุล"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
