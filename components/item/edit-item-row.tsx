import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { GroceryItem } from "@/models/grocery";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedIcon } from "../themed-icon";
import ThemedInput from "../themed-input";

type EditItemRowProps = {
  listId: string;
  item?: GroceryItem;
};

const EditItemRow = ({ listId, item }: EditItemRowProps) => {
  const muted = useThemeColor({}, "textMuted");
  const { addItem, updateItem, deleteItem } = useGroceryListStore();
  const [focused, setFocused] = useState(false);
  const [name, setName] = useState(item?.name ?? "");

  const onSubmit = () => {
    setFocused(false);
    const trimmed = name.trim();
    if (item) {
      if (trimmed) {
        updateItem(listId, item.id, { name: trimmed });
      } else {
        deleteItem(listId, item.id);
      }
    } else {
      if (trimmed) {
        addItem(listId, trimmed);
        setName("");
      }
    }
  };

  return (
    <View style={styles.row}>
      <ThemedIcon name={item ? "menu" : "add"} size={20} color={muted} />
      <ThemedInput
        onFocus={() => setFocused(true)}
        onChangeText={setName}
        onBlur={onSubmit}
        onSubmitEditing={onSubmit}
        submitBehavior={item ? "blurAndSubmit" : "submit"}
        placeholder={item ? undefined : "Add item..."}
        style={{
          marginLeft: 10,
          flex: 1,
          backgroundColor: "transparent",
          borderWidth: 0,
          padding: 5,
        }}
        value={name}
      />
      {focused && item && (
        <Pressable onPressIn={() => deleteItem(listId, item.id)}>
          <ThemedIcon name={"close"} size={20} color={muted} />
        </Pressable>
      )}
    </View>
  );
};

export default EditItemRow;

const styles = StyleSheet.create({
  row: {
    paddingBlock: 10,
    paddingInline: 20,
    flexDirection: "row",
    alignItems: "center",
  },
});
