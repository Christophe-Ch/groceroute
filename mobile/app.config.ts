import { ConfigContext, ExpoConfig } from "@expo/config";

export default ({ config }: ConfigContext) => {
  return {
    ...config,
    extra: {
      API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
    },
  } as ExpoConfig;
};
