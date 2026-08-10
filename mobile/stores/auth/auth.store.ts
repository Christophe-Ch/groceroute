import { create } from "zustand";
import { tokenService } from "@/services/token.service";
import { login, signup } from "@/api/auth";
import { produce } from "immer";
import { User } from "@/models/auth";
import { decodeUser } from "@/utils/decode-user";

type AuthStore = {
  token: string | null;
  currentUser: User | null;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

export const useAuthStore = create<AuthStore>((set) => {
  return {
    currentUser: null,
    token: null,
    isLoading: false,

    async init() {
      const applyToken = (token: string | null) => {
        set(
          produce((draft: AuthStore) => {
            draft.token = token;
            if (token) {
              draft.currentUser = decodeUser(token);
            }
          }),
        );
      };

      tokenService.subscribeToken(applyToken);
      applyToken(await tokenService.getAccessToken());
    },

    async login(email, password) {
      const { token, refreshToken } = await login(email, password);

      await tokenService.setTokens(token, refreshToken);
    },

    async signup(email, password) {
      const { token, refreshToken } = await signup(email, password);

      await tokenService.setTokens(token, refreshToken);
    },

    async logout() {
      await tokenService.clearTokens();
      set(
        produce((draft: AuthStore) => {
          draft.currentUser = null;
        }),
      );
    },
  };
});
