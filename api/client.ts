import { AuthResponse } from "@/models/auth";
import { tokenService } from "@/services/token.service";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";

export const client = axios.create({
  baseURL: Constants.expoConfig?.extra?.API_BASE_URL,
});

client.interceptors.request.use(async (config) => {
  const token = await tokenService.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshToken = await tokenService.getRefreshToken();
      if (!refreshToken) {
        throw new Error("Missing refresh token");
      }

      const {
        data: { token: newToken, refreshToken: newRefreshToken },
      } = await client.post<AuthResponse>("/auth/refresh", { refreshToken });

      await tokenService.setTokens(newToken, newRefreshToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return client(originalRequest);
    } catch (err) {
      await tokenService.clearTokens();
      return Promise.reject(err);
    }
  },
);
