import { ComponentProps } from "react";
import { useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ThemedIconProps = {
  name: ComponentProps<typeof Ionicons>["name"];
  size?: number;
  color?: string;
  lightColor?: string;
  darkColor?: string;
};

export const ThemedIcon = ({
  name,
  size = 24,
  color,
  lightColor = "#000000",
  darkColor = "#ffffff",
}: ThemedIconProps) => {
  const theme = useColorScheme();

  const iconColor = color || (theme === "dark" ? darkColor : lightColor);

  return <Ionicons name={name} size={size} color={iconColor} />;
};
