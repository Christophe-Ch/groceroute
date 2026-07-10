import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { GroceryItem } from "@/models/grocery";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { memo, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedIcon } from "../themed-icon";
import ThemedInput from "../themed-input";

type EditItemRowProps = {
  listId: string;
  item: GroceryItem;
};

const EditItemRow = ({ listId, item }: EditItemRowProps) => {
  const muted = useThemeColor({}, "textMuted");
  const { renameItem, setItemQuantity, deleteItem } = useGroceryListStore();
  const [focused, setFocused] = useState(false);
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity ?? "");
  const quantityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    setName(item.name);
    setQuantity(item.quantity ?? "");
  }, [item.name, item.quantity]);

  const onSubmit = () => {
    setFocused(false);
    const trimmed = name.trim();
    if (trimmed) {
      renameItem(listId, item.id, trimmed);
    } else {
      deleteItem(listId, item.id);
    }
  };

  const onQuantityChange = (value: string) => {
    setQuantity(value);
    if (quantityDebounceRef.current) clearTimeout(quantityDebounceRef.current);
    quantityDebounceRef.current = setTimeout(() => {
      setItemQuantity(listId, item.id, value);
    }, 400);
  };

  return (
    <View style={styles.row}>
      <ThemedIcon
        name="menu"
        size={20}
        color={muted}
        importantForAccessibility="no"
        accessibilityElementsHidden={true}
      />
      <ThemedInput
        onFocus={() => setFocused(true)}
        onChangeText={setName}
        onBlur={() => setFocused(false)}
        onSubmitEditing={onSubmit}
        submitBehavior="blurAndSubmit"
        style={styles.input}
        value={name}
        maxLength={100}
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
          onPress={() => deleteItem(listId, item.id)}
          style={styles.deleteButton}
          accessibilityRole="button"
          accessibilityLabel="Delete item"
        >
          <ThemedIcon
            name="close"
            size={20}
            color={muted}
            importantForAccessibility="no"
            accessibilityElementsHidden={true}
          />
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
    padding: 12,
  },
});
