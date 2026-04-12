import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const AuthLayout = () => {
  const backgroundColor = useThemeColor({}, "background");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <Stack screenOptions={{ headerShown: false, animation: "none" }} />
    </SafeAreaView>
  );
};

export default AuthLayout;
