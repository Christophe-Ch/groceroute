import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

type TokenListener = (token: string | null) => void;

class TokenService {
  private tokenListener?: TokenListener;

  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  }

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);

    this.tokenListener?.(accessToken);
  }

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

    this.tokenListener?.(null);
  }

  subscribeToken(listener: TokenListener): () => void {
    this.tokenListener = listener;
    return () => {
      if (this.tokenListener === listener) this.tokenListener = undefined;
    };
  }
}

export const tokenService = new TokenService();
