import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { GroceryItem } from "@/models/grocery";
import { useGroceryListStore } from "@/stores/groceries/grocery-list.store";
import { findItems } from "@/utils/autocomplete";
import { memo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedIcon } from "../themed-icon";
import ThemedInput from "../themed-input";
import { ThemedText } from "../themed-text";

type AddItemRowProps = {
  listId: string;
  pastItems?: GroceryItem[];
  currentItemIds?: Set<string>;
};

const AddItemRow = ({ listId, pastItems, currentItemIds }: AddItemRowProps) => {
  const muted = useThemeColor({}, "textMuted");
  const autocompleteBackground = useThemeColor({}, "surface");
  const { addItem, addPastItem } = useGroceryListStore();
  const [name, setName] = useState("");
  const [autocomplete, setAutocomplete] = useState<GroceryItem[] | null>(null);

  const onSubmit = () => {
    setAutocomplete(null);
    const trimmed = name.trim();
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
    if (text.trim().length >= 2) {
      if (pastItems)
        setAutocomplete(findItems(text, pastItems, currentItemIds));
    } else {
      setAutocomplete(null);
    }
  };

  return (
    <View>
      <View style={styles.row}>
        <ThemedIcon name="add" size={20} color={muted} />
        <ThemedInput
          onChangeText={onChangeText}
          onBlur={() => setAutocomplete(null)}
          onSubmitEditing={onSubmit}
          submitBehavior="submit"
          placeholder="Add item..."
          style={styles.input}
          value={name}
        />
      </View>
      {autocomplete && autocomplete.length > 0 && (
        <View
          style={[
            styles.autocomplete,
            { backgroundColor: autocompleteBackground },
          ]}
          accessibilityLiveRegion="polite"
        >
          {autocomplete.map((suggestion) => (
            <Pressable
              key={suggestion.id}
              style={styles.suggestion}
              accessibilityRole="button"
              accessibilityLabel={`Add ${suggestion.name}`}
              onPress={() => {
                addPastItem(listId, suggestion);
                setName("");
                setAutocomplete(null);
              }}
            >
              <ThemedText>{suggestion.name}</ThemedText>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

export default memo(AddItemRow);

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
  suggestion: {
    paddingVertical: 12,
  },
  input: {
    marginLeft: 10,
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 5,
  },
});
