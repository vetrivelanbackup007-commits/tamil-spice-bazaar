import { cookies } from "next/headers";
import { verifyToken, type JwtPayload } from "@/server/auth";

export function getAuthToken() {
  const cookieStore = cookies();
  return cookieStore.get("tsb_token")?.value || null;
}

export function getUserFromToken(): JwtPayload | null {
  const token = getAuthToken();
  if (!token) return null;
  return verifyToken(token);
}

export function isAdmin(): boolean {
  const user = getUserFromToken();
  return user?.role === "ADMIN";
}
