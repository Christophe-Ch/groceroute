import { useLogin, useSignup } from "@/hooks/auth/use-auth-mutations";
import { tokenService } from "@/services/token.service";
import { createContext, ReactNode, useEffect, useState } from "react";

interface AuthContextType {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = tokenService.subscribeToken(setToken);
    tokenService.getAccessToken().then((token) => {
      setToken(token);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginMutation = useLogin();
  const login = async (email: string, password: string) => {
    const { token, refreshToken } = await loginMutation.mutateAsync({
      email,
      password,
    });

    await tokenService.setTokens(token, refreshToken);
  };

  const signupMutation = useSignup();
  const signup = async (email: string, password: string) => {
    const { token, refreshToken } = await signupMutation.mutateAsync({
      email,
      password,
    });

    await tokenService.setTokens(token, refreshToken);
  };

  const logout = async () => {
    await tokenService.clearTokens();
  };

  return (
    <AuthContext value={{ token, login, logout, signup, isLoading }}>
      {children}
    </AuthContext>
  );
};
