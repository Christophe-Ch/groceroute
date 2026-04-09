import { computeDistances } from "@/domain/grocery/distance";
import { GroceryList } from "@/models/grocery/grocery-list";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { produce } from "immer";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import PlayItemRow from "../item/play-item-row";
import ThemedButton from "../themed-button";
import ThemedInput from "../themed-input";
import { ThemedText } from "../themed-text";

type PlayListProps = {
  list: GroceryList;
  onModeChange: () => void;
};

const PlayList = ({ list: baseList, onModeChange }: PlayListProps) => {
  const [list, setList] = useState(baseList);
  const items = [...list.items].sort((a, b) => +a.checked - +b.checked);

  const [checkOrder, setCheckOrder] = useState<Set<string>>(new Set());
  const { updateList } = useGroceryListStore();

  const onItemCheckedChange = (itemId: string, checked: boolean) => {
    setList((list) =>
      produce(list, (draft) => {
        draft.items.find((i) => i.id === itemId)!.checked = checked;
      }),
    );

    setCheckOrder((order) => {
      if (checked) {
        order.add(itemId);
      } else {
        order.delete(itemId);
      }
      return order;
    });
  };

  const onStop = () => {
    Alert.alert(
      "Stop shopping",
      "Are you sure you want to stop shopping? This will uncheck all items and move the list back to the main screen.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop",
          style: "destructive",
          onPress: () => {
            onModeChange();
          },
        },
      ],
    );
  };

  const onFinish = () => {
    Alert.alert(
      "Finish shopping",
      "Are you sure you want to finish shopping? This will clear the list and move it back to the main screen.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Finish",
          style: "destructive",
          onPress: () => {
            const distances = computeDistances(
              Array.from(checkOrder),
              list.distances,
            );
            updateList(list.id, {
              items: [],
              pastItems: [...list.pastItems, ...list.items],
              distances,
            });
            onModeChange();
          },
        },
      ],
    );
  };

  return (
    <>
      <ThemedInput
        style={styles.title}
        value={list.name}
        editable={false}
        maxLength={20}
      />

      <View style={styles.listHeader}>
        <ThemedText type="muted">
          {items.filter((i) => !i.checked).length} items left
        </ThemedText>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlayItemRow
            listId={list.id}
            item={item}
            onItemCheckedChange={onItemCheckedChange}
          />
        )}
        keyboardShouldPersistTaps="handled"
      />

      <View style={styles.actions}>
        <ThemedButton
          iconName="stop"
          style={{ height: "100%" }}
          onPress={onStop}
          type="danger"
        />
        <ThemedButton
          iconName="checkmark-done"
          text="Finish"
          style={{ flex: 1 }}
          onPress={onFinish}
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
    paddingBottom: 10,
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
