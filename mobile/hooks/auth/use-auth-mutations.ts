import { login, signup } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signup(email, password),
  });
};
