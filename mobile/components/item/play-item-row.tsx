import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { GroceryItem } from "@/models/grocery";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { memo, useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "../themed-text";

type PlayItemRowProps = {
  item: GroceryItem;
  onItemCheckChange: (itemId: string, checked: boolean) => void;
};

const PlayItemRow = ({ item, onItemCheckChange }: PlayItemRowProps) => {
  const [checked, setChecked] = useState(false);
  const muted = useThemeColor({}, "textMuted");
  const primary = useThemeColor({}, "primary");

  // Resyncs local state when the item changes underneath us, e.g. from a pull.
  // Should be derived during render instead; left as-is pending a look at the
  // editing behaviour in the running app.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setChecked(item.checked), [item.checked]);

  const toggle = () => {
    const next = !checked;
    setChecked(next);
    onItemCheckChange(item.id, next);
  };

  return (
    <Pressable
      style={styles.row}
      onPress={toggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={
        item.quantity ? `${item.name}, ${item.quantity}` : item.name
      }
      accessibilityHint="Double tap to toggle"
    >
      <Ionicons
        name={checked ? "checkmark-circle" : "ellipse-outline"}
        size={24}
        color={checked ? primary : muted}
        importantForAccessibility="no"
        accessibilityElementsHidden={true}
      />
      <ThemedText
        style={[
          styles.name,
          checked && { textDecorationLine: "line-through", color: muted },
        ]}
      >
        {item.name}
      </ThemedText>
      {item.quantity ? (
        <ThemedText
          style={[
            styles.quantity,
            { color: muted },
            checked && { textDecorationLine: "line-through" },
          ]}
        >
          {item.quantity}
        </ThemedText>
      ) : null}
    </Pressable>
  );
};

export default memo(PlayItemRow);

const styles = StyleSheet.create({
  row: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  name: {
    flex: 1,
    fontSize: 16,
  },
  quantity: {
    fontSize: 14,
    textAlign: "center",
    minWidth: 40,
  },
});
