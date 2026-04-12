import { ConfigContext, ExpoConfig } from "@expo/config";
import "dotenv/config";

export default ({ config }: ConfigContext) => {
  return {
    ...config,
    extra: {
      API_BASE_URL: process.env.API_BASE_URL ?? "",
    },
  } as ExpoConfig;
};
