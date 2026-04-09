import { GroceryList } from "@/models/grocery/grocery-list";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import ItemRow from "../item/item-row";
import ThemedInput from "../themed-input";
import { ThemedText } from "../themed-text";

type EditListProps = {
  list: GroceryList;
};

const EditList = ({ list }: EditListProps) => {
  const { updateList, reorderItems } = useGroceryListStore();

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
      <DraggableFlatList
        data={list.items}
        onDragEnd={(data) => reorderItems(list.id, data.data)}
        keyExtractor={(item) => item.id}
        renderItem={({ item, drag }) => (
          <TouchableOpacity onLongPress={drag}>
            <ItemRow listId={list.id} item={item} />
          </TouchableOpacity>
        )}
        ListFooterComponent={<ItemRow listId={list.id} />}
        keyboardShouldPersistTaps="handled"
        containerStyle={{ flex: 1 }}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
