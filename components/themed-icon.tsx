import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";

type ThemedIconProps = {
  name: ComponentProps<typeof Ionicons>["name"];
  size?: number;
  color?: string;
};

export const ThemedIcon = ({ name, size = 24, color }: ThemedIconProps) => {
  const iconColor = useThemeColor({}, "icon");

  return <Ionicons name={name} size={size} color={color ?? iconColor} />;
};
