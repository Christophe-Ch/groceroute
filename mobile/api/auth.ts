import { AuthResponse } from "@/models/auth";
import { client } from "./client";

export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>("/auth/login", {
    email,
    password,
  });

  return data;
};

export const signup = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>("/auth/signup", {
    email,
    password,
  });

  return data;
};
