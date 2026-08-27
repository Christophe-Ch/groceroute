import { ConfigContext, ExpoConfig } from "@expo/config";

export default ({ config }: ConfigContext) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
      eas: {
        projectId: "f3475bda-dd0e-4fad-a568-2f768143d19f",
      },
    },
  } as ExpoConfig;
};
