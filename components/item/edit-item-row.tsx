import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { GroceryItem } from "@/models/grocery";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { memo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedIcon } from "../themed-icon";
import ThemedInput from "../themed-input";

type EditItemRowProps = {
  listId: string;
  item: GroceryItem;
};

const EditItemRow = ({ listId, item }: EditItemRowProps) => {
  const muted = useThemeColor({}, "textMuted");
  const { updateItem, deleteItem } = useGroceryListStore();
  const [focused, setFocused] = useState(false);
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity);

  const onSubmit = () => {
    setFocused(false);
    const trimmed = name.trim();
    if (trimmed) {
      updateItem(listId, item.id, { name: trimmed });
    } else {
      deleteItem(listId, item.id);
    }
  };

  const onQuantityChange = (value: string) => {
    setQuantity(value);
    updateItem(listId, item.id, { quantity: value });
  };

  return (
    <View style={styles.row}>
      <ThemedIcon name="menu" size={20} color={muted} />
      <ThemedInput
        onFocus={() => setFocused(true)}
        onChangeText={setName}
        onBlur={() => setFocused(false)}
        onSubmitEditing={onSubmit}
        submitBehavior="blurAndSubmit"
        style={styles.input}
        value={name}
      />
      <ThemedInput
        onChangeText={onQuantityChange}
        value={quantity}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.quantityInput}
      />
      {focused && (
        <Pressable
          onPressIn={() => deleteItem(listId, item.id)}
          style={styles.deleteButton}
        >
          <ThemedIcon name="close" size={20} color={muted} />
        </Pressable>
      )}
    </View>
  );
};

export default memo(EditItemRow);

const styles = StyleSheet.create({
  row: {
    paddingBlock: 5,
    paddingInline: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  input: {
    marginLeft: 10,
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 5,
  },
  quantityInput: {
    width: 70,
    textAlign: "right",
  },
  deleteButton: {
    marginLeft: 20,
  },
});
