import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { ComponentProps } from "react";

type ThemedIconProps = {
  name: ComponentProps<typeof Ionicons>["name"];
  size?: number;
  color?: string;
  importantForAccessibility?: ComponentProps<typeof Ionicons>["importantForAccessibility"];
  accessibilityElementsHidden?: boolean;
};

export const ThemedIcon = ({
  name,
  size = 24,
  color,
  importantForAccessibility,
  accessibilityElementsHidden,
}: ThemedIconProps) => {
  const iconColor = useThemeColor({}, "icon");

  return (
    <Ionicons
      name={name}
      size={size}
      color={color ?? iconColor}
      importantForAccessibility={importantForAccessibility}
      accessibilityElementsHidden={accessibilityElementsHidden}
    />
  );
};
