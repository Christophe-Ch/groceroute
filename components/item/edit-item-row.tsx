import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { GroceryItem } from "@/models/grocery";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { findItems } from "@/utils/autocomplete";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedIcon } from "../themed-icon";
import ThemedInput from "../themed-input";
import { ThemedText } from "../themed-text";

type EditItemRowProps = {
  listId: string;
  item?: GroceryItem;
  pastItems?: GroceryItem[];
  currentItemIds?: Set<string>;
};

const EditItemRow = ({
  listId,
  item,
  pastItems,
  currentItemIds,
}: EditItemRowProps) => {
  const muted = useThemeColor({}, "textMuted");
  const { addItem, addPastItem, updateItem, deleteItem } =
    useGroceryListStore();
  const [focused, setFocused] = useState(false);
  const [autocomplete, setAutocomplete] = useState<GroceryItem[] | null>(null);
  const [name, setName] = useState(item?.name ?? "");
  const autocompleteBackground = useThemeColor({}, "surface");

  const onSubmit = () => {
    setFocused(false);
    setAutocomplete(null);
    const trimmed = name.trim();

    if (item) {
      return trimmed
        ? updateItem(listId, item.id, { name: trimmed })
        : deleteItem(listId, item.id);
    }

    if (!trimmed) return;

    const exactMatch = pastItems?.find(
      (p) =>
        p.name.toLowerCase() === trimmed.toLowerCase() &&
        !currentItemIds?.has(p.id),
    );
    if (exactMatch) {
      addPastItem(listId, exactMatch);
    } else {
      addItem(listId, trimmed);
    }
    setName("");
  };

  const onChangeText = (text: string) => {
    setName(text);
    if (!item && text.trim().length >= 2) {
      setAutocomplete(findItems(text, pastItems!, currentItemIds));
    } else {
      setAutocomplete(null);
    }
  };

  return (
    <View>
      <View style={styles.row}>
        <ThemedIcon name={item ? "menu" : "add"} size={20} color={muted} />
        <ThemedInput
          onFocus={() => setFocused(true)}
          onChangeText={onChangeText}
          onBlur={() => {
            setFocused(false);
            setAutocomplete(null);
          }}
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
      {!item && autocomplete?.length && (
        <View
          style={[
            styles.autocomplete,
            { backgroundColor: autocompleteBackground },
          ]}
        >
          {autocomplete.map((idea) => (
            <Pressable
              key={idea.id}
              style={{ paddingBlock: 3 }}
              onPress={() => {
                addPastItem(listId, idea);
                setName("");
                setAutocomplete(null);
              }}
            >
              <ThemedText>{idea.name}</ThemedText>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

export default EditItemRow;

const styles = StyleSheet.create({
  row: {
    paddingBlock: 5,
    paddingInline: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  autocomplete: {
    position: "absolute",
    top: "100%",
    left: 35,
    right: 20,
    paddingBlock: 10,
    paddingInline: 20,
    gap: 5,
    borderBottomEndRadius: 8,
    borderBottomStartRadius: 8,
  },
});
