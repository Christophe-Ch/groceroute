import ItemRow from "@/components/item/item-row";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";

type ListScreenParams = {
  listId: string;
};

const ListScreen = () => {
  const { listId } = useLocalSearchParams<ListScreenParams>();
  const { lists, reorderItems } = useGroceryListStore();

  const list = lists[listId];

  if (!list) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ThemedText>List not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1, paddingBlock: 20 }}>
      <ThemedText type="title" style={{ padding: 20 }}>
        {list?.name || listId}
      </ThemedText>
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
  listHeader: {
    paddingInline: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
