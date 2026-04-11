import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { GroceryItem } from "@/models/grocery";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "../themed-text";

type PlayItemRowProps = {
  listId: string;
  item: GroceryItem;
  onItemCheckedChange: (itemId: string, checked: boolean) => void;
};

const PlayItemRow = ({ item, onItemCheckedChange }: PlayItemRowProps) => {
  const [checked, setChecked] = useState(false);
  const muted = useThemeColor({}, "textMuted");
  const primary = useThemeColor({}, "primary");

  const toggle = () => {
    const next = !checked;
    setChecked(next);
    onItemCheckedChange(item.id, next);
  };

  return (
    <Pressable style={styles.row} onPress={toggle}>
      <Ionicons
        name={checked ? "checkmark-circle" : "ellipse-outline"}
        size={24}
        color={checked ? primary : muted}
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

export default PlayItemRow;

const styles = StyleSheet.create({
  row: {
    paddingVertical: 10,
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
