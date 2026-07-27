import { User } from "@/models/auth";
import { jwtDecode } from "jwt-decode";

export function decodeUser(token: string): User {
  const { id, sub: email } = jwtDecode<{ id: string; sub: string }>(token);
  return { id, email };
}
