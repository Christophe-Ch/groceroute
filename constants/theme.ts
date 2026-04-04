/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    // Text
    text: "#11181C",
    textMuted: "#687076",
    textInverse: "#FFFFFF",

    // Backgrounds / surfaces
    background: "#FFFFFF",
    surface: "#F8F9FA",
    surfaceElevated: "#FFFFFF",

    // Brand / primary
    primary: "#0a7ea4",
    primaryHover: "#086B8C",
    primaryPressed: "#065A76",

    // Borders / dividers
    border: "#D0D7DE",
    borderFocused: "#0a7ea4",

    // Inputs
    inputBackground: "#FFFFFF",
    inputText: "#11181C",
    inputPlaceholder: "#9BA1A6",
    inputBorder: "#D0D7DE",
    inputBorderFocused: "#0a7ea4",
    inputBorderError: "#D1242F",

    // Buttons
    buttonPrimaryBackground: "#0a7ea4",
    buttonPrimaryText: "#FFFFFF",
    buttonSecondaryBackground: "#E6F3F8",
    buttonSecondaryText: "#0a7ea4",
    buttonDisabledBackground: "#E5E7EB",
    buttonDisabledText: "#9BA1A6",

    // Feedback
    error: "#D1242F",
    warning: "#9A6700",
    success: "#1A7F37",
    info: "#0969DA",

    // Icons
    icon: "#687076",
  },

  dark: {
    // Text
    text: "#ECEDEE",
    textMuted: "#9BA1A6",
    textInverse: "#000000",

    // Backgrounds / surfaces
    background: "#151718",
    surface: "#1E2022",
    surfaceElevated: "#242628",

    // Brand / primary
    primary: "#FFFFFF",
    primaryHover: "#E5E7EB",
    primaryPressed: "#D1D5DB",

    // Borders / dividers
    border: "#30363D",
    borderFocused: "#FFFFFF",

    // Inputs
    inputBackground: "#1E2022",
    inputText: "#ECEDEE",
    inputPlaceholder: "#9BA1A6",
    inputBorder: "#30363D",
    inputBorderFocused: "#FFFFFF",
    inputBorderError: "#F85149",

    // Buttons
    buttonPrimaryBackground: "#FFFFFF",
    buttonPrimaryText: "#000000",
    buttonSecondaryBackground: "#30363D",
    buttonSecondaryText: "#ECEDEE",
    buttonDisabledBackground: "#2A2E32",
    buttonDisabledText: "#6E7681",

    // Feedback
    error: "#F85149",
    warning: "#D29922",
    success: "#3FB950",
    info: "#58A6FF",

    // Icons
    icon: "#9BA1A6",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
