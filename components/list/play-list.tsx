import { GroceryList } from "@/models/grocery/grocery-list";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import ItemRow from "../item/item-row";
import ThemedButton from "../themed-button";
import ThemedInput from "../themed-input";
import { ThemedText } from "../themed-text";

type PlayListProps = {
  list: GroceryList;
  onModeChange: () => void;
};

const PlayList = ({ list, onModeChange }: PlayListProps) => {
  const { reorderItems } = useGroceryListStore();

  return (
    <>
      <ThemedInput
        style={styles.title}
        value={list.name}
        editable={false}
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
        keyboardShouldPersistTaps="handled"
        containerStyle={{ flex: 1 }}
      />

      <View style={styles.actions}>
        <ThemedButton
          iconName="stop"
          style={{ height: "100%" }}
          onPress={onModeChange}
          type="danger"
        />
        <ThemedButton
          iconName="checkmark-done"
          text="Finish"
          style={{ flex: 1 }}
          onPress={onModeChange}
          type="success"
        />
      </View>
    </>
  );
};

export default PlayList;

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
  actions: {
    flexDirection: "row",
    paddingInline: 20,
    paddingTop: 20,
    gap: 12,
  },
});
