import ItemRow from "@/components/item/item-row";
import ThemedInput from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";

type ListScreenParams = {
  listId: string;
};

const ListScreen = () => {
  const { listId } = useLocalSearchParams<ListScreenParams>();
  const { lists, updateList, reorderItems } = useGroceryListStore();

  const list = lists[listId];
  const [listName, setListName] = useState(list?.name ?? "");

  if (!list) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ThemedText>List not found</ThemedText>
      </ThemedView>
    );
  }

  const onUpdateTitle = () => {
    const trimmed = listName.trim();
    if (trimmed && trimmed !== list.name) {
      updateList(listId, { name: trimmed });
    }
  };

  return (
    <ThemedView style={{ flex: 1, paddingBlock: 20 }}>
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
        onDragEnd={(data) => reorderItems(listId, data.data)}
        keyExtractor={(item) => item.id}
        renderItem={({ item, drag }) => (
          <TouchableOpacity onLongPress={drag}>
            <ItemRow listId={listId} item={item} />
          </TouchableOpacity>
        )}
        ListFooterComponent={<ItemRow listId={listId} />}
        keyboardShouldPersistTaps="handled"
        containerStyle={{ flex: 1 }}
      />
    </ThemedView>
  );
};

export default ListScreen;

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
