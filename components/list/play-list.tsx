import { computeDistances } from "@/domain/grocery/distance";
import { GroceryList } from "@/models/grocery/grocery-list";
import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { produce } from "immer";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { FlatList } from "react-native";
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
  const primary = useThemeColor({}, "primary");
  const trackColor = useThemeColor({}, "surfaceElevated");
  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;

  const [checkOrder, setCheckOrder] = useState<Set<string>>(
    new Set(["_start"]),
  );
  const { updateList } = useGroceryListStore();

  const updateDistances = () => {
    const distances = computeDistances(Array.from(checkOrder), list.distances);
    updateList(list.id, {
      items: [],
      pastItems: [
        ...list.pastItems,
        ...list.items
          .filter(
            (item) => !list.pastItems.some((past) => past.name === item.name),
          )
          .map((i) =>
            produce(i, (draft) => {
              draft.quantity = "";
            }),
          ),
      ],
      distances,
    });
  };

  const onItemCheckedChange = (itemId: string, checked: boolean) => {
    setList((list) =>
      produce(list, (draft) => {
        const target = draft.items.find((i) => i.id === itemId);
        if (target) target.checked = checked;
      }),
    );

    setCheckOrder((order) => {
      const next = new Set(order);
      if (checked) {
        next.add(itemId);
      } else {
        next.delete(itemId);
      }
      return next;
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
            updateDistances();
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
          {totalCount - checkedCount} items left
        </ThemedText>
        {totalCount > 0 && (
          <View style={[styles.progressTrack, { backgroundColor: trackColor }]}>
            <View style={{ flex: checkedCount, backgroundColor: primary }} />
            <View style={{ flex: Math.max(0, totalCount - checkedCount) }} />
          </View>
        )}
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
    gap: 8,
  },
  progressTrack: {
    height: 4,
    flexDirection: "row",
    borderRadius: 2,
    overflow: "hidden",
  },
  actions: {
    flexDirection: "row",
    paddingInline: 20,
    paddingTop: 20,
    gap: 12,
  },
});
