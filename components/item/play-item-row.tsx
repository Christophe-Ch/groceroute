import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { GroceryItem } from "@/models/grocery";
import { Checkbox } from "expo-checkbox";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import ThemedInput from "../themed-input";

type PlayItemRowProps = {
  listId: string;
  item: GroceryItem;
  onItemCheckedChange: (itemId: string, checked: boolean) => void;
};

const PlayItemRow = ({ item, onItemCheckedChange }: PlayItemRowProps) => {
  const [checked, setChecked] = useState(false);
  const muted = useThemeColor({}, "textMuted");

  const toggle = (checked: boolean) => {
    setChecked(checked);
    onItemCheckedChange(item.id, checked);
  };

  return (
    <View style={styles.row}>
      <Checkbox value={checked} onValueChange={toggle} />
      <ThemedInput
        editable={false}
        style={[
          styles.input,
          checked && { textDecorationLine: "line-through", color: muted },
        ]}
        value={item.name}
      />
      <ThemedInput
        editable={false}
        style={[
          styles.quantityInput,
          { color: muted },
          checked && { textDecorationLine: "line-through" },
        ]}
        value={item.quantity}
      />
    </View>
  );
};

export default PlayItemRow;

const styles = StyleSheet.create({
  row: {
    paddingBlock: 5,
    paddingInline: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 5,
  },
  quantityInput: {
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 5,
    textAlign: "center",
  },
});
