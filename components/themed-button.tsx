import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import React, { ComponentProps } from "react";
import { Pressable, PressableProps, StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";

export type ThemedButtonProps = PressableProps & {
  text?: string;
  iconName?: ComponentProps<typeof Ionicons>["name"];
  iconPosition?: "left" | "right";
  size?: "normal" | "small";
};

const ThemedButton = ({
  text,
  iconName,
  disabled,
  iconPosition = "left",
  size = "normal",
  style,
  ...props
}: ThemedButtonProps) => {
  const background = useThemeColor({}, "buttonPrimaryBackground");
  const textColor = useThemeColor({}, "buttonPrimaryText");
  const disabledBackground = useThemeColor({}, "buttonDisabledBackground");
  const disabledText = useThemeColor({}, "buttonDisabledText");

  const getBackgroundColor = (pressed: boolean) => {
    if (disabled) return disabledBackground;
    return pressed ? `${background}CC` : background;
  };

  const getSizeStyle = () => {
    if (!text) {
      return size === "normal" ? styles.sizeNormalIcon : styles.sizeSmallIcon;
    }

    return size === "normal" ? styles.sizeNormal : styles.sizeSmall;
  };

  return (
    <Pressable
      {...props}
      style={(state) => [
        styles.button,
        {
          flexDirection: iconPosition === "left" ? "row" : "row-reverse",
          backgroundColor: getBackgroundColor(state.pressed),
        },
        getSizeStyle(),
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {iconName && (
        <Ionicons
          size={size === "normal" ? 16 : 12}
          name={iconName}
          color={disabled ? disabledText : textColor}
        />
      )}
      {text && (
        <ThemedText
          style={[
            styles.buttonText,
            { color: disabled ? disabledText : textColor },
          ]}
        >
          {text}
        </ThemedText>
      )}
    </Pressable>
  );
};

export default ThemedButton;

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
  },
  sizeNormal: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  sizeSmall: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sizeNormalIcon: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sizeSmallIcon: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 16,
  },
});
