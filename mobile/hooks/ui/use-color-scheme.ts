import { useColorScheme as useRNColorScheme } from "react-native";

/**
 * React Native 0.83 widened ColorSchemeName with "unspecified". Normalise it to
 * null so callers can keep falling back with ??.
 */
export function useColorScheme(): "light" | "dark" | null {
  const colorScheme = useRNColorScheme();

  if (colorScheme === "light" || colorScheme === "dark") {
    return colorScheme;
  }

  return null;
}
