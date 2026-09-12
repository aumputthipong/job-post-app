import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";

type AuthState = {
  user: User | null;
  // False until Firebase has restored (or ruled out) a persisted session —
  // routing on `user` before then would flash the welcome screen.
  ready: boolean;
};

const AuthContext = createContext<AuthState>({ user: null, ready: false });

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({ user: auth.currentUser, ready: false });

  useEffect(
    () => onAuthStateChanged(auth, (user) => setState({ user, ready: true })),
    [],
  );

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

/** Firebase Auth error code → message a user can act on. */
export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
    case "auth/too-many-requests":
      return "ลองผิดหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่";
    case "auth/network-request-failed":
      return "เชื่อมต่อไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ต";
    default:
      return (error as Error)?.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่";
  }
}
