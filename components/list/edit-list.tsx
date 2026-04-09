import { GroceryList } from "@/models/grocery/grocery-list";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EditItemRow from "../item/edit-item-row";
import ThemedButton from "../themed-button";
import ThemedInput from "../themed-input";
import { ThemedText } from "../themed-text";

type EditListProps = {
  list: GroceryList;
  onModeChange: () => void;
};

const EditList = ({ list, onModeChange }: EditListProps) => {
  const { updateList, reorderItems } = useGroceryListStore();
  const insets = useSafeAreaInsets();

  const [listName, setListName] = useState(list.name);
  const onUpdateTitle = () => {
    const trimmed = listName.trim();
    if (trimmed && trimmed !== list.name) {
      updateList(list.id, { name: trimmed });
    }
  };

  return (
    <>
      <ThemedInput
        style={styles.title}
        value={listName}
        onChangeText={setListName}
        onBlur={onUpdateTitle}
        maxLength={20}
      />

      <View style={styles.listHeader}>
        <ThemedText type="muted">{list.items.length} items</ThemedText>
      </View>

      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={insets.top + 16}
        style={{ flex: 1 }}
      >
        <View style={{ zIndex: 1 }}>
          <EditItemRow listId={list.id} pastItems={list.pastItems} />
        </View>
        <DraggableFlatList
          data={list.items}
          onDragEnd={(data) => reorderItems(list.id, data.data)}
          keyExtractor={(item) => item.id}
          renderItem={({ item, drag }) => (
            <TouchableOpacity onLongPress={drag}>
              <EditItemRow listId={list.id} item={item} />
            </TouchableOpacity>
          )}
          keyboardShouldPersistTaps="handled"
          containerStyle={{ flex: 1 }}
        />
      </KeyboardAvoidingView>

      <ThemedButton
        iconName="play"
        text="Let's shop"
        style={{ marginInline: 20, marginTop: 20, alignSelf: "stretch" }}
        onPress={onModeChange}
      />
    </>
  );
};

export default EditList;

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
    margin: 20,
  },
  listHeader: {
    paddingInline: 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
